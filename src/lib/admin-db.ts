/**
 * @nhom        : Database / Admin
 * @chucnang    : Helper dùng Prisma cho CMS admin khi DATABASE_URL đã cấu hình
 * @lienquan    : src/lib/db.ts, prisma/schema.prisma
 * @alias       : admin-db, cms-db
 */

import { prisma } from '@/lib/db'
import type { ArticleStatus, FeedbackStatus, ProcedureType, Role } from '@prisma/client'

export function hasDatabase() {
  return Boolean(prisma)
}

export function getAdminDb() {
  if (!prisma) {
    throw new Error('Database chưa kết nối. Vui lòng cấu hình DATABASE_URL.')
  }
  return prisma
}

export async function ensureCmsUser(input: {
  userId: string
  email: string
  name: string
  role: Role
}) {
  const db = getAdminDb()

  return db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      isActive: true,
      lastLoginAt: new Date(),
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: undefined,
      role: input.role,
      googleId: input.userId === 'dev-admin' ? undefined : input.userId,
      isActive: true,
      lastLoginAt: new Date(),
    },
  })
}

export async function writeAuditLog(input: {
  userId: string
  email: string
  name: string
  role: Role
  action: string
  entity: string
  entityId?: string
  details?: Record<string, string | number | boolean | null>
  ipAddress?: string
}) {
  if (!hasDatabase()) return

  try {
    const db = getAdminDb()
    const user = await db.user.findUnique({ where: { email: input.email } })
      || await ensureCmsUser(input)
    await getAdminDb().auditLog.create({
      data: {
        userId: user.id,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details,
        ipAddress: input.ipAddress,
      },
    })
  } catch (err) {
    console.warn('[AuditLog] Không thể ghi nhật ký:', err)
  }
}

export function toProcedureType(value: unknown): ProcedureType {
  if (value === 'phi-dia-gioi') return 'PHI_DIA_GIOI'
  if (value === 'thuong-gap') return 'THUONG_GAP'
  return 'CAP_PHUONG'
}

export function toArticleStatus(value: unknown): ArticleStatus {
  if (value === 'ARCHIVED' || value === 'archived') return 'ARCHIVED'
  if (value === 'DRAFT' || value === 'draft') return 'DRAFT'
  return 'PUBLISHED'
}

export function toFeedbackStatus(value: unknown): FeedbackStatus {
  if (value === 'PROCESSING') return 'PROCESSING'
  if (value === 'RESOLVED') return 'RESOLVED'
  if (value === 'REJECTED') return 'REJECTED'
  return 'PENDING'
}

export function generateSlug(value: string): string {
  return value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
