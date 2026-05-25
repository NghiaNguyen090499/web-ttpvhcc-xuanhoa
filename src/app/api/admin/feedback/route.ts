/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản lý phản ánh — đọc danh sách + phản hồi + đổi trạng thái
 * @lienquan    : src/lib/queries.ts, data/feedbacks.json
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
  response?: string | null
  respondedAt?: string | null
  createdAt: string
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
  const auth = await requireAdminSession('EDITOR')
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
      })),
      total: feedbacks.length,
    })
  }

  const feedbacks = readFeedbacks()
  return NextResponse.json({ feedbacks, total: feedbacks.length })
}

/** PUT — Phản hồi phản ánh + đổi trạng thái */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID phản ánh' }, { status: 400 })
    }

    if (hasDatabase()) {
      const updated = await getAdminDb().feedback.update({
        where: { id: body.id },
        data: {
          status: toFeedbackStatus(body.status || 'PROCESSING'),
          response: body.response?.trim() || undefined,
          respondedAt: body.response ? new Date() : undefined,
        },
      })
      await writeAuditLog({
        ...auth.session,
        action: 'UPDATE',
        entity: 'feedback',
        entityId: updated.id,
        details: { status: updated.status },
      })
      return NextResponse.json({ success: true, feedback: updated })
    }

    // Fallback: cập nhật trong JSON
    const feedbacks = readFeedbacks()
    const index = feedbacks.findIndex((f) => f.id === body.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy phản ánh' }, { status: 404 })
    }

    feedbacks[index] = {
      ...feedbacks[index],
      status: body.status || feedbacks[index].status,
      response: body.response?.trim() || feedbacks[index].response,
      respondedAt: body.response ? new Date().toISOString() : feedbacks[index].respondedAt,
    }

    writeFeedbacks(feedbacks)

    return NextResponse.json({ success: true, feedback: feedbacks[index] })
  } catch (err) {
    console.error('[Admin/Feedback] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật phản ánh' }, { status: 500 })
  }
}
