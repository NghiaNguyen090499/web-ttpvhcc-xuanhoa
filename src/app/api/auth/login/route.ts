/**
 * @nhom        : API Routes / Auth
 * @chucnang    : POST /api/auth/login — đăng nhập tài khoản nội bộ CMS
 * @input       : { email, password } (JSON body)
 * @output      : { success, redirect } hoặc { error }
 * @lienquan    : src/lib/auth.ts
 * @alias       : login-api, dang-nhap
 *
 * Production: xác thực bằng email + mật khẩu hash trong database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import { verifyPassword } from '@/lib/password'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    let user = null

    if (hasDatabase()) {
      user = await getAdminDb().user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, role: true, isActive: true, passwordHash: true },
      })

      if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
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

    if (hasDatabase()) {
      await writeAuditLog({
        ...session,
        action: 'LOGIN',
        entity: 'auth',
      })
    }

    await createSession(session)

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
