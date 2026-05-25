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

  const organization = readJson<object>('organization.json')
  await prisma.pageContent.upsert({
    where: { pageKey: 'organization' },
    update: {
      title: 'Cơ cấu tổ chức',
      content: 'Cơ cấu tổ chức TTPVHCC Xuân Hòa',
      metadata: organization,
      isActive: true,
    },
    create: {
      pageKey: 'organization',
      title: 'Cơ cấu tổ chức',
      content: 'Cơ cấu tổ chức TTPVHCC Xuân Hòa',
      metadata: organization,
      isActive: true,
    },
  })

  await prisma.$disconnect()
  console.log('Seed completed: imported JSON data into PostgreSQL.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
