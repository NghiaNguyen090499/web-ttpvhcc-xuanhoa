/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Ký / xác minh JWT phiên admin — dùng chung cho proxy (không phụ thuộc DB, next/headers)
 * @lienquan    : src/lib/auth.ts, src/proxy.ts
 * @alias       : session-token, jwt
 *
 * Chính sách phiên:
 * - Cookie phiên (không maxAge) → mất khi đóng trình duyệt, không "duy trì đăng nhập"
 * - Hết hạn sau IDLE_TIMEOUT không thao tác; proxy gia hạn khi có request admin
 * - Tối đa ABSOLUTE_TIMEOUT kể từ lúc đăng nhập, dù vẫn đang thao tác
 * - Claim `sv` (sessionVersion) để thu hồi phiên phía server khi đăng xuất / đổi mật khẩu
 */

import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'admin-session'
export const IDLE_TIMEOUT_SECONDS = 30 * 60
export const ABSOLUTE_TIMEOUT_SECONDS = 8 * 60 * 60
// Chỉ ký lại token khi đã qua khoảng này — tránh set cookie ở mọi request
export const REFRESH_AFTER_SECONDS = 5 * 60

export interface SessionClaims {
  userId: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  sv: number
  authAt: number
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'dev-secret-thay-doi-trong-production'
  )
}

export function shouldUseSecureCookie(): boolean {
  if (process.env.AUTH_COOKIE_SECURE === 'false') return false
  return process.env.NODE_ENV === 'production'
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: 'lax' as const,
    path: '/',
  }
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = Math.min(now + IDLE_TIMEOUT_SECONDS, claims.authAt + ABSOLUTE_TIMEOUT_SECONDS)
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getSecret())
}

/** Xác minh chữ ký + hạn; trả claims kèm iat hoặc null */
export async function verifySessionToken(token: string): Promise<(SessionClaims & { iat: number }) | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const claims = payload as unknown as SessionClaims & { iat: number }
    const now = Math.floor(Date.now() / 1000)
    if (typeof claims.authAt !== 'number' || now - claims.authAt > ABSOLUTE_TIMEOUT_SECONDS) return null
    return claims
  } catch {
    return null
  }
}

/** Chỉ cho phép chuyển hướng nội bộ trong /admin — chặn open redirect sang site giả mạo */
export function safeAdminRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith('/admin') || value.startsWith('/admin/login')) return '/admin'
  if (/[\\\s]/.test(value) || value.includes('//')) return '/admin'
  return value
}
