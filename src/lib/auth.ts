/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Quản lý session JWT cho tài khoản nội bộ CMS
 * @output      : createSession(), getSession(), destroySession()
 * @lienquan    : src/proxy.ts, src/app/api/auth/
 * @alias       : auth, session, jwt, dang-nhap
 *
 * Sử dụng jose (edge-compatible) thay vì jsonwebtoken
 * Session lưu trong httpOnly cookie — bảo mật hơn localStorage
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

// --- Hằng số ---
const COOKIE_NAME = 'admin-session'
// Thời gian sống session: 8 giờ
const SESSION_TTL = '8h'
const SESSION_MAX_AGE = 8 * 60 * 60

/** Lấy JWT secret key dạng Uint8Array */
function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-thay-doi-trong-production'
  return new TextEncoder().encode(secret)
}

/** Thông tin session admin */
export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

/**
 * @chucnang    : Tạo session mới — ký JWT và set cookie
 * @input       : payload (SessionPayload) — thông tin người dùng
 * @output      : string — JWT token
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getJwtSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return token
}

/**
 * @chucnang    : Đọc session hiện tại từ cookie
 * @output      : SessionPayload | null
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const session = payload as unknown as SessionPayload

    if (!prisma || !session.email) return session

    try {
      const user = await prisma.user.findUnique({
        where: { email: session.email.toLowerCase().trim() },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      })

      if (!user || !user.isActive) return null

      return {
        userId: user.id,
        email: user.email,
        name: user.name || session.name || 'Admin',
        role: user.role,
      }
    } catch {
      return session
    }
  } catch {
    return null
  }
}

/**
 * @chucnang    : Hủy session — xóa cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
