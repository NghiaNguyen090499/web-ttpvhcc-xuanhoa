/**
 * @nhom        : Bảo mật / Middleware
 * @chucnang    : Bảo vệ routes admin — kiểm tra JWT session trước khi cho truy cập
 * @lienquan    : src/lib/auth.ts, src/app/admin/
 * @alias       : middleware, route-guard, bao-ve
 *
 * Matcher:
 * - /admin/* (trừ /admin/login) → redirect đến login nếu chưa đăng nhập
 * - /api/admin/* → trả 401 Unauthorized
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Tên cookie chứa session token
const COOKIE_NAME = 'admin-session'

/** Lấy JWT secret key */
function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'dev-secret-thay-doi-trong-production'
  )
}

/**
 * @chucnang    : Kiểm tra JWT token có hợp lệ không
 * @input       : token (string) — JWT từ cookie
 * @output      : boolean
 */
async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Bảo vệ trang admin (trừ login) ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await isValidToken(token))) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // --- Bảo vệ API admin ---
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await isValidToken(token))) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
