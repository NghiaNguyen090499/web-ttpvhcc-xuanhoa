/**
 * @nhom        : API Routes / Auth
 * @chucnang    : POST /api/auth/logout — đăng xuất admin, thu hồi phiên phía server
 * @output      : Redirect về /admin/login
 * @lienquan    : src/lib/auth.ts
 * @alias       : logout-api, dang-xuat
 *
 * Tăng sessionVersion → token cũ (kể cả bản bị sao chép) không còn dùng được.
 * Lưu ý: đăng xuất ở một nơi sẽ đăng xuất mọi thiết bị của tài khoản đó.
 */

import { NextRequest, NextResponse } from 'next/server'
import { destroySession, getSession, revokeUserSessions } from '@/lib/auth'
import { hasDatabase, writeAuditLog } from '@/lib/admin-db'
import { getClientIp } from '@/lib/login-rate-limit'

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (session && hasDatabase()) {
    try {
      await revokeUserSessions(session.userId)
      await writeAuditLog({
        ...session,
        action: 'LOGOUT',
        entity: 'auth',
        ipAddress: getClientIp(request.headers),
      })
    } catch (err) {
      console.error('[Auth] Lỗi thu hồi phiên khi đăng xuất:', err)
    }
  }

  await destroySession()
  return NextResponse.json({ success: true, redirect: '/admin/login' })
}
