/**
 * @nhom        : Database / Portal
 * @chucnang    : DB-first loaders cho public portal, fallback JSON khi chưa cấu hình DB
 * @lienquan    : src/lib/db.ts, src/lib/static-data.ts, prisma/schema.prisma
 * @alias       : portal-db, public-data
 */

import { prisma } from '@/lib/db'
import {
  getNewsData as getStaticNewsData,
  getProceduresData as getStaticProceduresData,
  getNiemYetData as getStaticNiemYetData,
  getTuyenTruyenData as getStaticTuyenTruyenData,
  getVanBanData as getStaticVanBanData,
} from '@/lib/static-data'
import type {
  NewsItem,
  NiemYetItem,
  ProceduresData,
  TuyenTruyenItem,
  VanBanItem,
} from '@/lib/static-data'

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toJsonString(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : undefined
}

function toNoticeFileType(value: string): 'pdf' | 'image' | 'doc' {
  if (value === 'image' || value === 'doc') return value
  return 'pdf'
}

export async function getPortalNewsData(): Promise<NewsItem[]> {
  if (!prisma) return getStaticNewsData()

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    })

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      date: formatDate(article.publishedAt || article.createdAt),
      tag: article.tag || 'Hành chính',
      image: article.coverImage || '/images/news/post-01.jpg',
      images: toJsonString(article.images),
      excerpt: article.excerpt || '',
      content: article.content,
      source: article.source || 'UBND Phường Xuân Hòa',
    }))
  } catch (err) {
    console.warn('[PortalDB] Fallback news JSON:', err)
    return getStaticNewsData()
  }
}

export async function getPortalNewsBySlug(slug: string): Promise<NewsItem | undefined> {
  const news = await getPortalNewsData()
  return news.find((item) => item.slug === slug)
}

export async function getPortalFaqData() {
  if (!prisma) {
    const { readFileSync } = await import('fs')
    const { join } = await import('path')
    const raw = readFileSync(join(process.cwd(), 'data', 'faq.json'), 'utf-8')
    return JSON.parse(raw) as Array<{
      id: string
      question: string
      answer: string
      category: string
      sortOrder: number
      isActive: boolean
      viewCount: number
    }>
  }

  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'Chung',
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
      viewCount: faq.viewCount,
    }))
  } catch (err) {
    console.warn('[PortalDB] Fallback FAQ JSON:', err)
    const { readFileSync } = await import('fs')
    const { join } = await import('path')
    const raw = readFileSync(join(process.cwd(), 'data', 'faq.json'), 'utf-8')
    return JSON.parse(raw)
  }
}

export async function getPortalProceduresData(): Promise<ProceduresData> {
  const fallback = getStaticProceduresData()
  if (!prisma) return fallback

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        procedures: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    })

    return {
      ...fallback,
      metadata: {
        ...fallback.metadata,
        totalCategories: categories.length,
        totalSubCategories: categories.reduce((sum, category) => sum + category.procedures.length, 0),
      },
      categories: categories.map((category) => ({
        id: fallback.categories.find((item) => item.slug === category.slug)?.id || category.id,
        name: category.name,
        type: 'cap-phuong',
        slug: category.slug,
        description: category.description || '',
        subCategories: category.procedures.map((procedure) => procedure.name),
      })),
      thuongGap: categories.flatMap((category) => (
        category.procedures
          .filter((procedure) => procedure.type === 'THUONG_GAP' || procedure.isFeatured)
          .map((procedure) => ({
            id: procedure.id,
            name: procedure.name,
            type: 'thuong-gap',
            category: category.name,
            slug: procedure.slug,
            description: procedure.description || category.description || '',
          }))
      )),
      phiDiaGioi: categories.flatMap((category) => (
        category.procedures
          .filter((procedure) => procedure.type === 'PHI_DIA_GIOI')
          .map((procedure) => ({
            id: procedure.id,
            name: procedure.name,
            type: 'phi-dia-gioi',
            category: category.name,
            slug: procedure.slug,
            description: procedure.description || category.description || '',
          }))
      )),
    }
  } catch (err) {
    console.warn('[PortalDB] Fallback procedures JSON:', err)
    return fallback
  }
}

export async function getPortalNiemYetData(): Promise<NiemYetItem[]> {
  if (!prisma) return getStaticNiemYetData()

  try {
    const items = await prisma.publicNotice.findMany({
      where: { isActive: true },
      orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
    })

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category || '',
      fileUrl: item.fileUrl,
      fileType: toNoticeFileType(item.fileType),
      publishedAt: formatDate(item.publishedAt),
      description: item.description || '',
    }))
  } catch (err) {
    console.warn('[PortalDB] Fallback notices JSON:', err)
    return getStaticNiemYetData()
  }
}

export async function getPortalTuyenTruyenData(): Promise<TuyenTruyenItem[]> {
  if (!prisma) return getStaticTuyenTruyenData()

  try {
    const items = await prisma.propagandaContent.findMany({
      where: { isActive: true },
      orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
    })

    return items.map((item) => ({
      id: item.id,
      icon: item.icon,
      tag: item.tag,
      tagColor: item.tagColor,
      title: item.title,
      summary: item.summary,
      content: item.content,
      publishedAt: formatDate(item.publishedAt),
      mediaType: item.mediaType === 'VIDEO' ? 'video' : item.mediaType === 'FILE' ? 'file' : 'article',
      mediaUrl: item.mediaUrl || undefined,
      fileName: item.fileName || undefined,
      fileSize: item.fileSize || undefined,
    }))
  } catch (err) {
    console.warn('[PortalDB] Fallback propaganda JSON:', err)
    return getStaticTuyenTruyenData()
  }
}

export async function getPortalVanBanData(): Promise<VanBanItem[]> {
  if (!prisma) return getStaticVanBanData()

  try {
    const items = await prisma.directiveDocument.findMany({
      where: { isActive: true },
      orderBy: [{ ngayBanHanh: 'desc' }, { sortOrder: 'asc' }],
    })

    return items.map((item) => ({
      id: item.id,
      soKyHieu: item.soKyHieu,
      loai: item.loai,
      trichYeu: item.trichYeu,
      ngayBanHanh: formatDate(item.ngayBanHanh),
      coQuanBanHanh: item.coQuanBanHanh,
      nguoiKy: item.nguoiKy,
      linhVuc: item.linhVuc,
      fileUrl: item.fileUrl,
      trangThai: item.trangThai,
    }))
  } catch (err) {
    console.warn('[PortalDB] Fallback directives JSON:', err)
    return getStaticVanBanData()
  }
}
