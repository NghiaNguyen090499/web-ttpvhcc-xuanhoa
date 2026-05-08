/**
 * @nhom        : Database Queries
 * @chucnang    : Tập trung tất cả truy vấn DB — pages KHÔNG import Prisma trực tiếp
 * @lienquan    : src/lib/db.ts, prisma/schema.prisma
 * @alias       : queries, data-access, db-queries
 *
 * Quy ước kế thừa ShopHoa:
 * - Mọi truy vấn DB đều đi qua file này
 * - Server Components gọi hàm từ file này
 * - API Routes validate input trước khi gọi hàm từ file này
 */

import { prisma } from '@/lib/db'
import type { ProcedureType, ArticleStatus, FeedbackStatus } from '@prisma/client'

// ============================================================
// CATEGORY — Lĩnh vực TTHC
// ============================================================

/** Lấy danh sách lĩnh vực đang hoạt động */
export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { procedures: true } }
    }
  })
}

/** Lấy lĩnh vực theo slug */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      procedures: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
}

// ============================================================
// PROCEDURE — Thủ tục hành chính
// ============================================================

/** Lấy danh sách thủ tục theo lĩnh vực */
export async function getProceduresByCategory(categoryId: string) {
  return prisma.procedure.findMany({
    where: { categoryId, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { category: true }
  })
}

/** Lấy thủ tục theo slug */
export async function getProcedureBySlug(slug: string) {
  return prisma.procedure.findUnique({
    where: { slug },
    include: { category: true }
  })
}

/** Lấy thủ tục nổi bật (hiển thị trang chủ) */
export async function getFeaturedProcedures(limit = 6) {
  return prisma.procedure.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { viewCount: 'desc' },
    include: { category: true }
  })
}

/** Tìm kiếm thủ tục */
export async function searchProcedures(query: string, type?: ProcedureType) {
  return prisma.procedure.findMany({
    where: {
      isActive: true,
      ...(type && { type }),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: { category: true },
    take: 20
  })
}

/** Tăng lượt xem thủ tục */
export async function incrementProcedureView(id: string) {
  return prisma.procedure.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  })
}

// ============================================================
// ARTICLE — Tin tức / Bài viết
// ============================================================

/** Lấy danh sách bài viết đã xuất bản */
export async function getPublishedArticles(page = 1, perPage = 10) {
  const skip = (page - 1) * perPage

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' as ArticleStatus },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage,
      include: { author: { select: { name: true, image: true } } }
    }),
    prisma.article.count({ where: { status: 'PUBLISHED' as ArticleStatus } })
  ])

  return { articles, total, totalPages: Math.ceil(total / perPage) }
}

/** Lấy bài viết theo slug */
export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true, image: true } } }
  })
}

/** Lấy bài viết nổi bật */
export async function getFeaturedArticles(limit = 4) {
  return prisma.article.findMany({
    where: { status: 'PUBLISHED' as ArticleStatus, isFeatured: true },
    take: limit,
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true, image: true } } }
  })
}

// ============================================================
// FAQ — Câu hỏi thường gặp
// ============================================================

/** Lấy danh sách FAQ đang hoạt động */
export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  })
}

/** Tìm FAQ liên quan (dùng cho chatbot RAG) */
export async function searchFaqs(query: string) {
  return prisma.faq.findMany({
    where: {
      isActive: true,
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 5
  })
}

// ============================================================
// PAGE CONTENT — Nội dung trang tĩnh
// ============================================================

/** Lấy nội dung trang theo key */
export async function getPageContent(pageKey: string) {
  return prisma.pageContent.findUnique({
    where: { pageKey }
  })
}

// ============================================================
// FEEDBACK — Phản ánh / Góp ý
// ============================================================

/** Tạo phản ánh mới */
export async function createFeedback(data: {
  name: string
  email?: string
  phone?: string
  subject: string
  content: string
}) {
  return prisma.feedback.create({ data })
}

/** Lấy danh sách phản ánh (admin) */
export async function getFeedbacks(status?: FeedbackStatus, page = 1, perPage = 20) {
  const skip = (page - 1) * perPage

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage
    }),
    prisma.feedback.count({ where: status ? { status } : undefined })
  ])

  return { feedbacks, total, totalPages: Math.ceil(total / perPage) }
}

// ============================================================
// AUDIT LOG — Nhật ký hoạt động
// ============================================================

/** Ghi nhật ký hoạt động */
export async function createAuditLog(data: {
  userId: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, string | number | boolean | null>
  ipAddress?: string
}) {
  return prisma.auditLog.create({ data })
}
