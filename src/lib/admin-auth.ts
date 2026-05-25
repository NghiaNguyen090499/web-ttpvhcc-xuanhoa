/**
 * @nhom        : Bảo mật / Admin
 * @chucnang    : Helper kiểm tra session và phân quyền cho admin API
 * @lienquan    : src/lib/auth.ts, src/app/api/admin/*
 * @alias       : admin-auth, rbac
 */

import { NextResponse } from 'next/server'
import { getSession, type SessionPayload } from '@/lib/auth'

export type AdminRole = SessionPayload['role']

const ROLE_RANK: Record<AdminRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
}

export function hasRole(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole]
}

export async function requireAdminSession(requiredRole: AdminRole = 'EDITOR') {
  const session = await getSession()

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
        { status: 401 }
      ),
    }
  }

  if (!hasRole(session.role, requiredRole)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Không đủ quyền thực hiện thao tác này' },
        { status: 403 }
      ),
    }
  }

  return { session, response: null }
}
