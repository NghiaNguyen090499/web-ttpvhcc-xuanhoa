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
import { hashPassword, isStrongEnoughPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/password'

const ROLES = new Set<Role>(['ADMIN', 'EDITOR', 'VIEWER'])

function normalizeRole(value: unknown): Role | null {
  return typeof value === 'string' && ROLES.has(value as Role) ? value as Role : null
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text || null
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
      currentUserId: auth.session.userId,
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

  return NextResponse.json({ users, total: users.length, mode: 'database', currentUserId: auth.session.userId })
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
  const email = normalizeEmail(body.email)
  const role = normalizeRole(body.role) || 'VIEWER'
  const password = typeof body.password === 'string' ? body.password : ''
  const name = normalizeOptionalText(body.name)

  if (!email) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  if (!password || !isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 })
  }

  const user = await getAdminDb().user.upsert({
    where: { email },
    update: {
      name: name ?? undefined,
      role,
      passwordHash: hashPassword(password),
      isActive: body.isActive ?? true,
    },
    create: {
      email,
      name: name || email,
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
  const email = body.email === undefined ? undefined : normalizeEmail(body.email)
  const name = normalizeOptionalText(body.name)
  const password = typeof body.password === 'string' ? body.password : ''
  const isActive = body.isActive === undefined ? undefined : body.isActive

  if (!body.id) {
    return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 })
  }

  if (body.email !== undefined && !email) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  if (body.role !== undefined && !role) {
    return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Trạng thái tài khoản không hợp lệ' }, { status: 400 })
  }

  if (password && !isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 })
  }

  const db = getAdminDb()
  const target = await db.user.findUnique({
    where: { id: String(body.id) },
    select: { id: true, email: true, role: true, isActive: true },
  })

  if (!target) {
    return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
  }

  if (target.id === auth.session.userId) {
    if (email && email !== target.email) {
      return NextResponse.json({ error: 'Không thể tự đổi email đăng nhập của chính mình' }, { status: 400 })
    }

    if (role && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không thể tự hạ quyền ADMIN của chính mình' }, { status: 400 })
    }

    if (isActive === false) {
      return NextResponse.json({ error: 'Không thể tự khóa tài khoản đang đăng nhập' }, { status: 400 })
    }
  }

  const nextRole = role || target.role
  const nextActive = isActive ?? target.isActive

  if (target.role === 'ADMIN' && (nextRole !== 'ADMIN' || !nextActive)) {
    const remainingActiveAdmins = await db.user.count({
      where: {
        id: { not: target.id },
        role: 'ADMIN',
        isActive: true,
      },
    })

    if (remainingActiveAdmins === 0) {
      return NextResponse.json({ error: 'Phải giữ lại ít nhất một ADMIN đang hoạt động' }, { status: 400 })
    }
  }

  if (email && email !== target.email) {
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
    if (existing && existing.id !== target.id) {
      return NextResponse.json({ error: 'Email này đã được dùng cho tài khoản khác' }, { status: 409 })
    }
  }

  const user = await db.user.update({
    where: { id: target.id },
    data: {
      email: email || undefined,
      name,
      role: role || undefined,
      passwordHash: password ? hashPassword(password) : undefined,
      // Đổi mật khẩu → thu hồi mọi phiên đang mở của tài khoản
      sessionVersion: password ? { increment: 1 } : undefined,
      isActive,
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('ADMIN')
    if (auth.response) return auth.response

    if (!hasDatabase()) {
      return NextResponse.json(
        { error: 'Chưa kết nối database nên chưa thể xóa người dùng.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : ''

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 })
    }

    if (id === auth.session.userId) {
      return NextResponse.json({ error: 'Không thể tự xóa tài khoản đang đăng nhập' }, { status: 400 })
    }

    const db = getAdminDb()
    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!target) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    if (target.role === 'ADMIN' && target.isActive) {
      const activeAdmins = await db.user.count({ where: { role: 'ADMIN', isActive: true } })
      if (activeAdmins <= 1) {
        return NextResponse.json({ error: 'Phải giữ lại ít nhất một ADMIN đang hoạt động' }, { status: 400 })
      }
    }

    const [articleCount, auditLogCount] = await Promise.all([
      db.article.count({ where: { authorId: target.id } }),
      db.auditLog.count({ where: { userId: target.id } }),
    ])

    await db.$transaction([
      db.article.updateMany({
        where: { authorId: target.id },
        data: { authorId: auth.session.userId },
      }),
      db.auditLog.deleteMany({ where: { userId: target.id } }),
      db.user.delete({ where: { id: target.id } }),
    ])

    await writeAuditLog({
      ...auth.session,
      action: 'DELETE',
      entity: 'user',
      entityId: target.id,
      details: {
        email: target.email,
        role: target.role,
        reassignedArticles: articleCount,
        removedAuditLogs: auditLogCount,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/Users] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa người dùng' }, { status: 500 })
  }
}
