/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Quản lý session JWT — tạo, đọc, hủy phiên đăng nhập admin
 * @output      : createSession(), getSession(), destroySession()
 * @lienquan    : src/middleware.ts, src/app/api/auth/
 * @alias       : auth, session, jwt, dang-nhap
 *
 * Sử dụng jose (edge-compatible) thay vì jsonwebtoken
 * Session lưu trong httpOnly cookie — bảo mật hơn localStorage
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

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
  role: 'ADMIN' | 'EDITOR'
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
    return payload as unknown as SessionPayload
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

/**
 * @chucnang    : Tạo URL đăng nhập Google OAuth
 * @output      : string — Google OAuth URL
 */
export function getGoogleOAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * @chucnang    : Đổi authorization code lấy thông tin user từ Google
 * @input       : code (string) — authorization code từ Google
 * @output      : { email, name, picture, googleId } hoặc null
 */
export async function exchangeGoogleCode(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

  // Bước 1: Đổi code lấy access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) return null
  const tokenData = await tokenRes.json()

  // Bước 2: Lấy thông tin user
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) return null
  const userData = await userRes.json()

  return {
    email: userData.email as string,
    name: userData.name as string,
    picture: userData.picture as string,
    googleId: userData.id as string,
  }
}
