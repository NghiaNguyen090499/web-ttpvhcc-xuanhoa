/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản lý phản ánh — đọc danh sách + phản hồi (gửi email tới người dân) + đổi trạng thái
 * @lienquan    : src/lib/queries.ts, src/lib/feedback-email.ts, data/feedbacks.json
 * @alias       : admin-feedback-api
 *
 * Khi DB chưa kết nối: fallback đọc/ghi từ JSON
 * Khi DB kết nối: dùng Prisma queries
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, toFeedbackStatus, writeAuditLog } from '@/lib/admin-db'
import { decryptOptional } from '@/lib/crypto'
import { sendFeedbackResponse, type FeedbackEmailResult } from '@/lib/feedback-email'
import {
  AttachmentError,
  parseAttachments,
  prepareAttachments,
  removeAttachments,
  storeAttachments,
  toMailAttachments,
  withAttachmentUrls,
  type FeedbackAttachment,
} from '@/lib/feedback-attachments'

export const runtime = 'nodejs'

const MAX_RESPONSE_LENGTH = 5000

const FEEDBACK_FILE = join(process.cwd(), 'data', 'feedbacks.json')

// Kiểu dữ liệu phản ánh
interface FeedbackItem {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  subject: string
  content: string
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
  attachments?: FeedbackAttachment[] | null
  response?: string | null
  responseAttachments?: FeedbackAttachment[] | null
  respondedAt?: string | null
  createdAt: string
}

/** Thêm URL xem tệp đính kèm cho client */
function serializeAttachments(attachments: unknown, responseAttachments: unknown) {
  return {
    attachments: withAttachmentUrls(parseAttachments(attachments), 'citizen'),
    responseAttachments: withAttachmentUrls(parseAttachments(responseAttachments), 'response'),
  }
}

/** Đọc body JSON hoặc multipart (khi cán bộ đính kèm tệp trả lời) */
async function readPutBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const field = (key: string) => {
      const value = formData.get(key)
      return typeof value === 'string' ? value : undefined
    }
    return {
      id: field('id'),
      status: field('status'),
      response: field('response'),
      files: formData.getAll('attachments'),
    }
  }
  const json = await request.json()
  return {
    id: typeof json?.id === 'string' ? json.id : undefined,
    status: typeof json?.status === 'string' ? json.status : undefined,
    response: typeof json?.response === 'string' ? json.response : undefined,
    files: [] as FormDataEntryValue[],
  }
}

// Đọc dữ liệu từ JSON (fallback)
function readFeedbacks(): FeedbackItem[] {
  try {
    const raw = readFileSync(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(raw) as FeedbackItem[]
  } catch {
    return []
  }
}

// Ghi dữ liệu ra JSON
function writeFeedbacks(data: FeedbackItem[]) {
  writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/** GET — Lấy danh sách phản ánh */
export async function GET() {
  const auth = await requireAdminSession('VIEWER')
  if (auth.response) return auth.response

  if (hasDatabase()) {
    const feedbacks = await getAdminDb().feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({
      feedbacks: feedbacks.map((feedback) => ({
        ...feedback,
        name: decryptOptional(feedback.name) || feedback.name,
        email: decryptOptional(feedback.email),
        phone: decryptOptional(feedback.phone),
        ...serializeAttachments(feedback.attachments, feedback.responseAttachments),
      })),
      total: feedbacks.length,
    })
  }

  const feedbacks = readFeedbacks().map((feedback) => ({
    ...feedback,
    ...serializeAttachments(feedback.attachments, feedback.responseAttachments),
  }))
  return NextResponse.json({ feedbacks, total: feedbacks.length })
}

/** PUT — Phản hồi phản ánh + đổi trạng thái */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await readPutBody(request)

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID phản ánh' }, { status: 400 })
    }

    const responseText = body.response?.trim() || ''
    if (responseText.length > MAX_RESPONSE_LENGTH) {
      return NextResponse.json({ error: `Phản hồi tối đa ${MAX_RESPONSE_LENGTH} ký tự` }, { status: 400 })
    }

    // Tệp đính kèm chỉ đi cùng nội dung phản hồi
    const prepared = await prepareAttachments(responseText ? body.files : [], 'response')

    if (hasDatabase()) {
      const db = getAdminDb()
      const existing = await db.feedback.findUnique({ where: { id: body.id }, select: { id: true } })
      if (!existing) {
        return NextResponse.json({ error: 'Không tìm thấy phản ánh' }, { status: 404 })
      }

      const stored = await storeAttachments(prepared, 'response')
      let updated
      try {
        updated = await db.feedback.update({
          where: { id: body.id },
          data: {
            status: toFeedbackStatus(body.status || 'PROCESSING'),
            response: responseText || undefined,
            // Phản hồi mới thay phản hồi cũ → danh sách tệp cũng thay theo
            responseAttachments: responseText ? stored : undefined,
            respondedAt: responseText ? new Date() : undefined,
          },
        })
      } catch (err) {
        await removeAttachments(stored, 'response')
        throw err
      }

      // Gửi phản hồi tới email người dân (nếu họ có cung cấp email)
      let email: FeedbackEmailResult | null = null
      const citizenEmail = decryptOptional(updated.email)
      if (responseText && citizenEmail) {
        email = await sendFeedbackResponse({
          to: citizenEmail,
          name: decryptOptional(updated.name) || updated.name,
          subject: updated.subject,
          content: updated.content,
          response: responseText,
          createdAt: updated.createdAt,
          attachments: toMailAttachments(prepared),
        })
      }

      await writeAuditLog({
        ...auth.session,
        action: 'UPDATE',
        entity: 'feedback',
        entityId: updated.id,
        details: { status: updated.status, responseAttachments: stored.length, responseEmailSent: email?.sent ?? null },
      })
      return NextResponse.json({
        success: true,
        feedback: {
          id: updated.id,
          status: updated.status,
          response: updated.response,
          respondedAt: updated.respondedAt,
          responseAttachments: withAttachmentUrls(parseAttachments(updated.responseAttachments), 'response'),
        },
        emailSent: email ? email.sent : null,
      })
    }

    // Fallback: cập nhật trong JSON
    const feedbacks = readFeedbacks()
    const index = feedbacks.findIndex((f) => f.id === body.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy phản ánh' }, { status: 404 })
    }

    const stored = await storeAttachments(prepared, 'response')
    feedbacks[index] = {
      ...feedbacks[index],
      status: (toFeedbackStatus(body.status || feedbacks[index].status) as FeedbackItem['status']),
      response: responseText || feedbacks[index].response,
      responseAttachments: responseText ? stored : feedbacks[index].responseAttachments,
      respondedAt: responseText ? new Date().toISOString() : feedbacks[index].respondedAt,
    }

    writeFeedbacks(feedbacks)

    return NextResponse.json({
      success: true,
      feedback: {
        ...feedbacks[index],
        ...serializeAttachments(feedbacks[index].attachments, feedbacks[index].responseAttachments),
      },
      emailSent: null,
    })
  } catch (err) {
    if (err instanceof AttachmentError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[Admin/Feedback] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật phản ánh' }, { status: 500 })
  }
}
