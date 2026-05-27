/**
 * @nhom        : Database / Seed
 * @chucnang    : Import dữ liệu JSON hiện tại vào PostgreSQL/Supabase
 * @lienquan    : data/*.json, prisma/schema.prisma
 * @alias       : seed, import-json
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from '../src/lib/password'

type NewsItem = {
  id?: string
  title: string
  slug?: string
  date?: string
  tag?: string
  image?: string
  images?: string[]
  excerpt?: string
  content: string
  source?: string
}

type FaqItem = {
  id?: string
  question: string
  answer: string
  category?: string
  sortOrder?: number
  isActive?: boolean
  viewCount?: number
}

type ProceduresFile = {
  categories: Array<{
    id?: string
    name: string
    slug?: string
    type?: string
    description?: string
    subCategories?: string[]
  }>
}

type FeedbackItem = {
  id?: string
  name: string
  email?: string | null
  phone?: string | null
  subject: string
  content: string
  status?: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
  response?: string | null
  respondedAt?: string | null
  createdAt?: string
}

type PropagandaItem = {
  id?: string
  icon?: string
  tag?: string
  tagColor?: string
  title: string
  summary?: string
  content?: string
  publishedAt?: string
  mediaType?: 'article' | 'video' | 'file'
  mediaUrl?: string
  fileName?: string
  fileSize?: number
}

type PublicNoticeItem = {
  id?: string
  title: string
  category?: string
  fileUrl: string
  fileType?: string
  publishedAt?: string
  description?: string
}

type DirectiveDocumentItem = {
  id?: string
  soKyHieu: string
  loai: string
  trichYeu: string
  ngayBanHanh: string
  coQuanBanHanh: string
  nguoiKy: string
  linhVuc: string
  fileUrl: string
  trangThai: string
}

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), 'data', fileName), 'utf-8')) as T
}

function generateSlug(value: string): string {
  return value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toProcedureType(value?: string) {
  if (value === 'phi-dia-gioi') return 'PHI_DIA_GIOI' as const
  if (value === 'thuong-gap') return 'THUONG_GAP' as const
  return 'CAP_PHUONG' as const
}

function toMediaType(value?: string) {
  if (value === 'video') return 'VIDEO' as const
  if (value === 'file') return 'FILE' as const
  return 'ARTICLE' as const
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl || databaseUrl.includes('placeholder') || databaseUrl.includes('johndoe')) {
    throw new Error('DATABASE_URL chưa cấu hình. Không thể seed production DB.')
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) })

  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@xuanhoa.gov.vn' },
    update: {
      role: 'ADMIN',
      isActive: true,
      passwordHash: hashPassword(process.env.SEED_ADMIN_PASSWORD || process.env.DEV_ADMIN_PASSWORD || 'admin12345'),
    },
    create: {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@xuanhoa.gov.vn',
      name: 'Admin Xuân Hòa',
      role: 'ADMIN',
      passwordHash: hashPassword(process.env.SEED_ADMIN_PASSWORD || process.env.DEV_ADMIN_PASSWORD || 'admin12345'),
      isActive: true,
    },
  })

  const news = readJson<NewsItem[]>('news.json')
  for (const item of news) {
    const slug = item.slug || generateSlug(item.title)
    await prisma.article.upsert({
      where: { slug },
      update: {
        title: item.title,
        tag: item.tag,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.image,
        images: item.images || undefined,
        source: item.source,
        status: 'PUBLISHED',
        publishedAt: item.date ? new Date(`${item.date}T00:00:00.000Z`) : new Date(),
      },
      create: {
        title: item.title,
        slug,
        tag: item.tag,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.image,
        images: item.images || undefined,
        source: item.source,
        status: 'PUBLISHED',
        publishedAt: item.date ? new Date(`${item.date}T00:00:00.000Z`) : new Date(),
        authorId: admin.id,
      },
    })
  }

  const faq = readJson<FaqItem[]>('faq.json')
  for (const [index, item] of faq.entries()) {
    const id = item.id || `faq-${index + 1}`
    await prisma.faq.upsert({
      where: { id },
      update: {
        question: item.question,
        answer: item.answer,
        category: item.category || 'Chung',
        sortOrder: item.sortOrder ?? index + 1,
        isActive: item.isActive ?? true,
        viewCount: item.viewCount ?? 0,
      },
      create: {
        id,
        question: item.question,
        answer: item.answer,
        category: item.category || 'Chung',
        sortOrder: item.sortOrder ?? index + 1,
        isActive: item.isActive ?? true,
        viewCount: item.viewCount ?? 0,
      },
    })
  }

  const procedures = readJson<ProceduresFile>('procedures.json')
  for (const [categoryIndex, item] of procedures.categories.entries()) {
    const slug = item.slug || generateSlug(item.name)
    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: item.name,
        description: item.description || '',
        sortOrder: categoryIndex + 1,
        isActive: true,
      },
      create: {
        name: item.name,
        slug,
        description: item.description || '',
        sortOrder: categoryIndex + 1,
        isActive: true,
      },
    })

    for (const [procedureIndex, procedureName] of (item.subCategories || []).entries()) {
      const procedureSlug = `${slug}-${generateSlug(procedureName)}-${procedureIndex + 1}`
      await prisma.procedure.upsert({
        where: { slug: procedureSlug },
        update: {
          name: procedureName,
          type: toProcedureType(item.type),
          sortOrder: procedureIndex + 1,
          isActive: true,
          categoryId: category.id,
        },
        create: {
          name: procedureName,
          slug: procedureSlug,
          type: toProcedureType(item.type),
          sortOrder: procedureIndex + 1,
          isActive: true,
          categoryId: category.id,
        },
      })
    }
  }

  const feedbacks = readJson<FeedbackItem[]>('feedbacks.json')
  for (const item of feedbacks) {
    await prisma.feedback.upsert({
      where: { id: item.id || generateSlug(item.subject) },
      update: {
        name: item.name,
        email: item.email,
        phone: item.phone,
        subject: item.subject,
        content: item.content,
        status: item.status || 'PENDING',
        response: item.response,
        respondedAt: item.respondedAt ? new Date(item.respondedAt) : undefined,
      },
      create: {
        id: item.id || generateSlug(item.subject),
        name: item.name,
        email: item.email,
        phone: item.phone,
        subject: item.subject,
        content: item.content,
        status: item.status || 'PENDING',
        response: item.response,
        respondedAt: item.respondedAt ? new Date(item.respondedAt) : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      },
    })
  }

  const propaganda = readJson<PropagandaItem[]>('tuyen-truyen.json')
  for (const [index, item] of propaganda.entries()) {
    const id = item.id || `tt-${index + 1}`
    await prisma.propagandaContent.upsert({
      where: { id },
      update: {
        icon: item.icon || '📢',
        tag: item.tag || 'Tuyên truyền',
        tagColor: item.tagColor || 'blue',
        title: item.title,
        summary: item.summary || item.title,
        content: item.content || item.summary || item.title,
        publishedAt: item.publishedAt ? new Date(`${item.publishedAt}T00:00:00.000Z`) : new Date(),
        mediaType: toMediaType(item.mediaType),
        mediaUrl: item.mediaUrl,
        fileName: item.fileName,
        fileSize: item.fileSize,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        id,
        icon: item.icon || '📢',
        tag: item.tag || 'Tuyên truyền',
        tagColor: item.tagColor || 'blue',
        title: item.title,
        summary: item.summary || item.title,
        content: item.content || item.summary || item.title,
        publishedAt: item.publishedAt ? new Date(`${item.publishedAt}T00:00:00.000Z`) : new Date(),
        mediaType: toMediaType(item.mediaType),
        mediaUrl: item.mediaUrl,
        fileName: item.fileName,
        fileSize: item.fileSize,
        sortOrder: index + 1,
        isActive: true,
      },
    })
  }

  const publicNotices = readJson<PublicNoticeItem[]>('niem-yet.json')
  for (const [index, item] of publicNotices.entries()) {
    const id = item.id || `ny-${index + 1}`
    await prisma.publicNotice.upsert({
      where: { id },
      update: {
        title: item.title,
        category: item.category,
        fileUrl: item.fileUrl,
        fileType: item.fileType || 'pdf',
        publishedAt: item.publishedAt ? new Date(`${item.publishedAt}T00:00:00.000Z`) : new Date(),
        description: item.description,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        id,
        title: item.title,
        category: item.category,
        fileUrl: item.fileUrl,
        fileType: item.fileType || 'pdf',
        publishedAt: item.publishedAt ? new Date(`${item.publishedAt}T00:00:00.000Z`) : new Date(),
        description: item.description,
        sortOrder: index + 1,
        isActive: true,
      },
    })
  }

  const directiveDocuments = readJson<DirectiveDocumentItem[]>('van-ban.json')
  for (const [index, item] of directiveDocuments.entries()) {
    const id = item.id || `vb-${index + 1}`
    await prisma.directiveDocument.upsert({
      where: { id },
      update: {
        soKyHieu: item.soKyHieu,
        loai: item.loai,
        trichYeu: item.trichYeu,
        ngayBanHanh: new Date(`${item.ngayBanHanh}T00:00:00.000Z`),
        coQuanBanHanh: item.coQuanBanHanh,
        nguoiKy: item.nguoiKy,
        linhVuc: item.linhVuc,
        fileUrl: item.fileUrl,
        trangThai: item.trangThai,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        id,
        soKyHieu: item.soKyHieu,
        loai: item.loai,
        trichYeu: item.trichYeu,
        ngayBanHanh: new Date(`${item.ngayBanHanh}T00:00:00.000Z`),
        coQuanBanHanh: item.coQuanBanHanh,
        nguoiKy: item.nguoiKy,
        linhVuc: item.linhVuc,
        fileUrl: item.fileUrl,
        trangThai: item.trangThai,
        sortOrder: index + 1,
        isActive: true,
      },
    })
  }

  const pageContents = [
    {
      pageKey: 'organization',
      title: 'Cơ cấu tổ chức',
      content: 'Cơ cấu tổ chức TTPVHCC Xuân Hòa',
      metadata: readJson<object>('organization.json'),
    },
    {
      pageKey: 'procedure-links',
      title: 'Link thủ tục hành chính DVC',
      content: 'Danh sách đường dẫn thủ tục hành chính trên Cổng DVC Quốc gia',
      metadata: readJson<object>('procedure-links.json'),
    },
    {
      pageKey: 'lich-cong-tac',
      title: 'Lịch công tác tuần',
      content: 'Lịch công tác tuần của lãnh đạo UBND Phường Xuân Hòa',
      metadata: readJson<object>('lich-cong-tac.json'),
    },
    {
      pageKey: 'lich-tiep-dan',
      title: 'Lịch tiếp công dân',
      content: 'Lịch tiếp công dân định kỳ của UBND Phường Xuân Hòa',
      metadata: readJson<object>('lich-tiep-dan.json'),
    },
    {
      pageKey: 'useful-links',
      title: 'Liên kết hữu ích',
      content: 'Danh sách cổng thông tin liên kết',
      metadata: readJson<object>('useful-links.json'),
    },
    {
      pageKey: 'ward-info',
      title: 'Thông tin phường',
      content: 'Thông tin đơn vị, giờ làm việc và liên kết DVC',
      metadata: readJson<object>('ward-info.json'),
    },
  ]

  for (const page of pageContents) {
    await prisma.pageContent.upsert({
      where: { pageKey: page.pageKey },
      update: {
        title: page.title,
        content: page.content,
        metadata: page.metadata,
        isActive: true,
      },
      create: {
        pageKey: page.pageKey,
        title: page.title,
        content: page.content,
        metadata: page.metadata,
        isActive: true,
      },
    })
  }

  await prisma.$disconnect()
  console.log('Seed completed: imported JSON data into PostgreSQL.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
