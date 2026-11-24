/**
 * @nhom        : Bảo mật / Proxy (thay thế middleware — Next.js 16)
 * @chucnang    : Bảo vệ routes admin — kiểm tra JWT session trước khi cho truy cập
 * @lienquan    : src/lib/auth.ts, src/lib/session-token.ts, src/app/admin/
 * @alias       : proxy, route-guard, bao-ve
 *
 * Matcher:
 * - /admin/* (trừ /admin/login) → redirect đến login nếu chưa đăng nhập
 * - /api/admin/* → trả 401 Unauthorized
 * - Token hợp lệ và đã cũ hơn REFRESH_AFTER → ký lại để gia hạn thời gian chờ (sliding idle timeout)
 * - Gắn header x-admin-pathname để admin layout biết trang hiện tại
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  REFRESH_AFTER_SECONDS,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from '@/lib/session-token'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySessionToken(token) : null

  // --- Bảo vệ trang admin (trừ login) ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    const response = NextResponse.redirect(loginUrl)
    if (token) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  // --- Bảo vệ API admin ---
  if (pathname.startsWith('/api/admin') && !session) {
    return NextResponse.json(
      { error: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
      { status: 401 }
    )
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-admin-pathname', pathname)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (session && Math.floor(Date.now() / 1000) - session.iat > REFRESH_AFTER_SECONDS) {
    const { userId, email, name, role, sv, authAt } = session
    const refreshed = await signSessionToken({ userId, email, name, role, sv, authAt })
    response.cookies.set(SESSION_COOKIE, refreshed, sessionCookieOptions())
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
