/**
 * @nhom        : Database
 * @chucnang    : Khởi tạo Prisma Client với driver adapter cho Supabase
 * @output      : prisma (PrismaClient) — singleton instance
 * @lienquan    : prisma/schema.prisma, .env
 * @alias       : db, prisma-client, database-connection
 *
 * Sử dụng @prisma/adapter-pg thay vì datasourceUrl trực tiếp
 * để tương thích với Prisma v7 + Supabase connection pooling
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Hàm tạo Prisma Client với driver adapter
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL chưa được cấu hình trong .env')
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
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
