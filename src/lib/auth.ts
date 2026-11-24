/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Quản lý session JWT cho tài khoản nội bộ CMS
 * @output      : createSession(), getSession(), destroySession()
 * @lienquan    : src/proxy.ts, src/app/api/auth/
 * @alias       : auth, session, jwt, dang-nhap
 *
 * Sử dụng jose (edge-compatible) thay vì jsonwebtoken
 * Session lưu trong httpOnly cookie — bảo mật hơn localStorage
 * Chính sách hết hạn / thu hồi phiên: xem src/lib/session-token.ts
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from '@/lib/session-token'

/** Thông tin session admin */
export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

/**
 * @chucnang    : Tạo session mới — ký JWT và set cookie phiên (mất khi đóng trình duyệt)
 * @input       : payload (SessionPayload), sessionVersion — phiên bản phiên hiện tại của user
 * @output      : string — JWT token
 */
export async function createSession(payload: SessionPayload, sessionVersion = 0): Promise<string> {
  const token = await signSessionToken({
    ...payload,
    sv: sessionVersion,
    authAt: Math.floor(Date.now() / 1000),
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions())

  return token
}

/**
 * @chucnang    : Đọc session hiện tại từ cookie — đối chiếu DB (khóa tài khoản, phiên đã thu hồi)
 * @output      : SessionPayload | null
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifySessionToken(token)
  if (!session) return null

  if (!prisma || !session.email) return session

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, role: true, isActive: true, sessionVersion: true },
    })

    if (!user || !user.isActive || user.sessionVersion !== (session.sv ?? 0)) return null

    return {
      userId: user.id,
      email: user.email,
      name: user.name || session.name || 'Admin',
      role: user.role,
    }
  } catch {
    return session
  }
}

/**
 * @chucnang    : Hủy session — xóa cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * @chucnang    : Thu hồi mọi phiên đang mở của user (token cũ không còn hợp lệ)
 * @input       : userId (string)
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  if (!prisma) return
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  })
}
