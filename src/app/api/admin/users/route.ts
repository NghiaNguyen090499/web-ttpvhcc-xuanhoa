/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản lý người dùng CMS và phân quyền
 * @lienquan    : src/lib/admin-auth.ts, src/lib/admin-db.ts, prisma/schema.prisma
 * @alias       : admin-users-api, rbac-users
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Role } from '@prisma/client'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import { hashPassword, isStrongEnoughPassword } from '@/lib/password'

const ROLES = new Set<Role>(['ADMIN', 'EDITOR', 'VIEWER'])

function normalizeRole(value: unknown): Role | null {
  return typeof value === 'string' && ROLES.has(value as Role) ? value as Role : null
}

export async function GET() {
  const auth = await requireAdminSession('ADMIN')
  if (auth.response) return auth.response

  if (!hasDatabase()) {
    return NextResponse.json({
      users: [{
        id: 'dev-admin',
        email: auth.session.email,
        name: auth.session.name,
        role: auth.session.role,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      }],
      total: 1,
      mode: 'json-fallback',
    })
  }

  const users = await getAdminDb().user.findMany({
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ users, total: users.length, mode: 'database' })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession('ADMIN')
  if (auth.response) return auth.response

  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'Chưa kết nối database nên chưa thể tạo người dùng phân quyền.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const email = body.email?.trim().toLowerCase()
  const role = normalizeRole(body.role) || 'VIEWER'
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) {
    return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 })
  }

  if (!password || !isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }, { status: 400 })
  }

  const user = await getAdminDb().user.upsert({
    where: { email },
    update: {
      name: body.name?.trim() || undefined,
      role,
      passwordHash: hashPassword(password),
      isActive: body.isActive ?? true,
    },
    create: {
      email,
      name: body.name?.trim() || email,
      role,
      passwordHash: hashPassword(password),
      isActive: body.isActive ?? true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  await writeAuditLog({
    ...auth.session,
    action: 'UPSERT',
    entity: 'user',
    entityId: user.id,
    details: { email: user.email, role: user.role },
  })

  return NextResponse.json({ success: true, user })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession('ADMIN')
  if (auth.response) return auth.response

  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'Chưa kết nối database nên chưa thể cập nhật phân quyền.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const role = body.role === undefined ? undefined : normalizeRole(body.role)
  const password = typeof body.password === 'string' ? body.password : ''

  if (!body.id) {
    return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 })
  }

  if (body.role !== undefined && !role) {
    return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
  }

  if (password && !isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }, { status: 400 })
  }

  const user = await getAdminDb().user.update({
    where: { id: body.id },
    data: {
      name: body.name?.trim(),
      role: role || undefined,
      passwordHash: password ? hashPassword(password) : undefined,
      isActive: body.isActive,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  await writeAuditLog({
    ...auth.session,
    action: 'UPDATE',
    entity: 'user',
    entityId: user.id,
    details: { email: user.email, role: user.role, isActive: user.isActive },
  })

  return NextResponse.json({ success: true, user })
}
