/**
 * @nhom        : Database
 * @chucnang    : Khởi tạo Prisma Client với driver adapter cho Supabase
 * @output      : prisma (PrismaClient) — singleton instance hoặc null khi chưa có DB
 * @lienquan    : prisma/schema.prisma, .env
 * @alias       : db, prisma-client, database-connection
 *
 * Sử dụng @prisma/adapter-pg thay vì datasourceUrl trực tiếp
 * để tương thích với Prisma v7 + Supabase connection pooling
 *
 * Khi chưa có DATABASE_URL (demo mode): trả về null thay vì throw error
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Hàm tạo Prisma Client với driver adapter
function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL

  // Nếu chưa có DATABASE_URL hoặc đang dùng placeholder → trả null
  if (!connectionString || connectionString.includes('placeholder') || connectionString.includes('johndoe')) {
    console.warn('⚠️ DATABASE_URL chưa cấu hình — chạy ở chế độ demo (dùng JSON tĩnh)')
    return null
  }

  // Khởi tạo adapter PostgreSQL
  const adapter = new PrismaPg(connectionString)

  // Tạo Prisma Client với adapter
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

// Singleton pattern — tránh tạo nhiều connection trong dev (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
