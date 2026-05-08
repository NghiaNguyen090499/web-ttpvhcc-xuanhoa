/**
 * @nhom        : API Routes / Auth
 * @chucnang    : POST /api/auth/login — đăng nhập dev mode cho admin
 * @input       : { email, password } (JSON body)
 * @output      : { success, redirect } hoặc { error }
 * @lienquan    : src/lib/auth.ts
 * @alias       : login-api, dang-nhap
 *
 * Dev mode: kiểm tra ADMIN_EMAILS + DEV_ADMIN_PASSWORD từ .env
 * Production: route này bị vô hiệu hóa, chỉ dùng Google OAuth
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      )
    }

    // Danh sách email admin được phép (mặc định cho dev)
    const allowedEmails = (process.env.ADMIN_EMAILS || 'admin@xuanhoa.gov.vn')
      .split(',')
      .map((e) => e.trim().toLowerCase())

    // Mật khẩu dev (chỉ dùng trong development)
    const devPassword = process.env.DEV_ADMIN_PASSWORD || 'admin123'

    // Kiểm tra email có trong danh sách
    if (!allowedEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email không có quyền truy cập admin' },
        { status: 403 }
      )
    }

    // Kiểm tra mật khẩu
    if (password !== devPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Tạo session
    await createSession({
      userId: 'dev-admin',
      email: email.toLowerCase(),
      name: 'Admin (Dev)',
      role: 'ADMIN',
    })

    // Lấy redirect URL từ query hoặc mặc định /admin
    const from = request.nextUrl.searchParams.get('from') || '/admin'

    return NextResponse.json({ success: true, redirect: from })
  } catch (err) {
    console.error('[Auth] Lỗi đăng nhập:', err)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    )
  }
}
