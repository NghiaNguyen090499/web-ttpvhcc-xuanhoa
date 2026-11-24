/**
 * @nhom        : API Routes / Auth
 * @chucnang    : POST /api/auth/login — đăng nhập tài khoản nội bộ CMS
 * @input       : { email, password } (JSON body)
 * @output      : { success, redirect } hoặc { error }
 * @lienquan    : src/lib/auth.ts
 * @alias       : login-api, dang-nhap
 *
 * Production: xác thực bằng email + mật khẩu hash trong database
 * Chống dò mật khẩu: src/lib/login-rate-limit.ts · Chống open redirect: safeAdminRedirect()
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import { verifyPassword } from '@/lib/password'
import { safeAdminRedirect } from '@/lib/session-token'
import {
  clearLoginFailures,
  getClientIp,
  getLockRemainingSeconds,
  recordLoginFailure,
} from '@/lib/login-rate-limit'

function lockedResponse(seconds: number) {
  return NextResponse.json(
    { error: `Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(seconds / 60)} phút.` },
    { status: 429, headers: { 'Retry-After': String(seconds) } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim().slice(0, 200)
    const ip = getClientIp(request.headers)
    const lockSeconds = getLockRemainingSeconds(ip, normalizedEmail)
    if (lockSeconds > 0) return lockedResponse(lockSeconds)

    let user = null

    if (hasDatabase()) {
      user = await getAdminDb().user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, role: true, isActive: true, passwordHash: true, sessionVersion: true },
      })

      if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        recordLoginFailure(ip, normalizedEmail)
        const lockedNow = getLockRemainingSeconds(ip, normalizedEmail)
        if (lockedNow > 0) return lockedResponse(lockedNow)
        return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
      }

      if (!user.isActive) {
        return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 })
      }

      await getAdminDb().user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
    } else if (process.env.NODE_ENV !== 'production') {
      const allowedEmails = (process.env.ADMIN_EMAILS || 'admin@xuanhoa.gov.vn')
        .split(',')
        .map((e) => e.trim().toLowerCase())
      const devPassword = process.env.DEV_ADMIN_PASSWORD || 'admin123'

      if (!allowedEmails.includes(normalizedEmail) || password !== devPassword) {
        return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
      }
    } else {
      return NextResponse.json(
        { error: 'Database chưa kết nối. Không thể đăng nhập production.' },
        { status: 503 }
      )
    }

    const session = {
      userId: user?.id || 'dev-admin',
      email: normalizedEmail,
      name: user?.name || 'Admin',
      role: user?.role || 'ADMIN',
    } as const

    clearLoginFailures(normalizedEmail)

    if (hasDatabase()) {
      await writeAuditLog({
        ...session,
        action: 'LOGIN',
        entity: 'auth',
        ipAddress: ip,
      })
    }

    await createSession(session, user?.sessionVersion ?? 0)

    // Chỉ chuyển hướng nội bộ trong /admin
    const from = safeAdminRedirect(request.nextUrl.searchParams.get('from'))

    return NextResponse.json({ success: true, redirect: from })
  } catch (err) {
    console.error('[Auth] Lỗi đăng nhập:', err)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    )
  }
}
