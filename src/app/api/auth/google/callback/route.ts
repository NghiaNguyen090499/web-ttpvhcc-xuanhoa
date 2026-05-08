/**
 * @nhom        : API Routes / Auth
 * @chucnang    : GET /api/auth/google/callback — xử lý callback từ Google OAuth
 * @input       : ?code=xxx (query param từ Google)
 * @output      : Redirect về /admin (thành công) hoặc /admin/login (thất bại)
 * @lienquan    : src/lib/auth.ts
 * @alias       : google-callback, oauth-callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeGoogleCode, createSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/login?error=no_code', request.url)
    )
  }

  try {
    // Đổi code lấy thông tin user từ Google
    const googleUser = await exchangeGoogleCode(code)

    if (!googleUser) {
      return NextResponse.redirect(
        new URL('/admin/login?error=google_failed', request.url)
      )
    }

    // Kiểm tra email có quyền admin không
    const allowedEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    if (allowedEmails.length > 0 && !allowedEmails.includes(googleUser.email.toLowerCase())) {
      return NextResponse.redirect(
        new URL('/admin/login?error=not_allowed', request.url)
      )
    }

    // Tạo session
    await createSession({
      userId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      role: 'ADMIN',
    })

    return NextResponse.redirect(new URL('/admin', request.url))
  } catch (err) {
    console.error('[Auth] Lỗi Google OAuth callback:', err)
    return NextResponse.redirect(
      new URL('/admin/login?error=server_error', request.url)
    )
  }
}
