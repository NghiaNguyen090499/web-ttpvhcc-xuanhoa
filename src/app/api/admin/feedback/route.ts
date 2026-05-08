/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản lý phản ánh — đọc danh sách (admin)
 * @lienquan    : src/lib/queries.ts
 * @alias       : admin-feedback-api
 *
 * Khi DB chưa kết nối: trả mảng rỗng
 * Khi DB kết nối: dùng Prisma queries
 */

import { NextResponse } from 'next/server'

/** GET — Lấy danh sách phản ánh */
export async function GET() {
  try {
    // Thử đọc từ DB
    const { getFeedbacks } = await import('@/lib/queries')
    const result = await getFeedbacks(undefined, 1, 50)
    return NextResponse.json({
      feedbacks: result.feedbacks,
      total: result.total,
    })
  } catch {
    // DB chưa kết nối — trả mảng rỗng
    return NextResponse.json({ feedbacks: [], total: 0 })
  }
}
