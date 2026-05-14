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
  try {
    // Thử đọc từ DB trước
    const { getFeedbacks } = await import('@/lib/queries')
    const result = await getFeedbacks(undefined, 1, 50)
    return NextResponse.json({
      feedbacks: result.feedbacks,
      total: result.total,
    })
  } catch {
    // DB chưa kết nối — fallback đọc JSON
    const feedbacks = readFeedbacks()
    return NextResponse.json({ feedbacks, total: feedbacks.length })
  }
}

/** PUT — Phản hồi phản ánh + đổi trạng thái */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID phản ánh' }, { status: 400 })
    }

    // Thử cập nhật trong DB trước
    try {
      const { prisma } = await import('@/lib/db')
      if (prisma) {
        const updated = await prisma.feedback.update({
          where: { id: body.id },
          data: {
            status: body.status || 'PROCESSING',
            response: body.response?.trim() || undefined,
            respondedAt: body.response ? new Date() : undefined,
          },
        })
        return NextResponse.json({ success: true, feedback: updated })
      }
    } catch {
      // DB không khả dụng — tiếp tục với JSON
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
