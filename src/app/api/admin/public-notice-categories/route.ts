import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import {
  NOTICE_CATEGORIES_PAGE_KEY,
  normalizeNoticeCategories,
  normalizeNoticeCategoryName,
  readNoticeCategoriesFile,
  writeNoticeCategoriesFile,
  sanitizeNoticeCategory,
  type PublicNoticeCategory,
} from '@/lib/public-notice-categories'

const NOTICE_FILE = join(process.cwd(), 'data', 'niem-yet.json')
type NoticeRow = { category?: string }

function readFallbackNotices(): NoticeRow[] {
  try { return JSON.parse(readFileSync(NOTICE_FILE, 'utf-8')) as NoticeRow[] } catch { return [] }
}

async function readCategories() {
  if (!hasDatabase()) return readNoticeCategoriesFile()
  const content = await getAdminDb().pageContent.findUnique({ where: { pageKey: NOTICE_CATEGORIES_PAGE_KEY }, select: { metadata: true } })
  const metadata = content?.metadata as { items?: unknown } | null
  return normalizeNoticeCategories(metadata?.items)
}

async function writeCategories(categories: PublicNoticeCategory[]) {
  if (hasDatabase()) {
    await getAdminDb().pageContent.upsert({
      where: { pageKey: NOTICE_CATEGORIES_PAGE_KEY },
      update: { title: 'Danh mục niêm yết', content: 'Danh mục được quản lý trong CMS.', metadata: { items: categories }, isActive: true },
      create: { pageKey: NOTICE_CATEGORIES_PAGE_KEY, title: 'Danh mục niêm yết', content: 'Danh mục được quản lý trong CMS.', metadata: { items: categories }, isActive: true },
    })
    return
  }
  writeNoticeCategoriesFile(categories)
}

async function getUsageCounts() {
  const counts = new Map<string, number>()
  if (hasDatabase()) {
    const notices = await getAdminDb().publicNotice.findMany({ select: { category: true } })
    for (const notice of notices) if (notice.category) counts.set(notice.category, (counts.get(notice.category) || 0) + 1)
    return counts
  }
  for (const notice of readFallbackNotices()) if (notice.category) counts.set(notice.category, (counts.get(notice.category) || 0) + 1)
  return counts
}

export async function GET() {
  try {
    const auth = await requireAdminSession('VIEWER')
    if (auth.response) return auth.response
    const [categories, usage] = await Promise.all([readCategories(), getUsageCounts()])
    return NextResponse.json({ items: categories.map((category) => ({ ...category, usedCount: usage.get(category.name) || 0 })), total: categories.length })
  } catch (error) {
    console.error('[Admin/PublicNoticeCategories] Lỗi tải:', error)
    return NextResponse.json({ error: 'Không thể tải danh mục niêm yết' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response
    const body = await request.json()
    const name = normalizeNoticeCategoryName(body.name)
    if (!name) return NextResponse.json({ error: 'Tên danh mục là bắt buộc' }, { status: 400 })
    const categories = await readCategories()
    if (categories.some((category) => category.name.toLocaleLowerCase('vi-VN') === name.toLocaleLowerCase('vi-VN'))) {
      return NextResponse.json({ error: 'Danh mục đã tồn tại' }, { status: 409 })
    }
    const category = sanitizeNoticeCategory({ id: `category-${Date.now()}`, name, sortOrder: categories.length + 1 }, undefined, categories.length + 1)
    if (!category) return NextResponse.json({ error: 'Tên danh mục không hợp lệ' }, { status: 400 })
    await writeCategories([...categories, category])
    await writeAuditLog({ ...auth.session, action: 'CREATE', entity: 'public_notice_category', entityId: category.id, details: { name: category.name } })
    return NextResponse.json({ success: true, item: { ...category, usedCount: 0 } })
  } catch (error) {
    console.error('[Admin/PublicNoticeCategories] Lỗi tạo:', error)
    return NextResponse.json({ error: 'Không thể tạo danh mục' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response
    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    const name = normalizeNoticeCategoryName(body.name)
    if (!id || !name) return NextResponse.json({ error: 'Thiếu danh mục hoặc tên danh mục' }, { status: 400 })
    const categories = await readCategories()
    const index = categories.findIndex((category) => category.id === id)
    if (index < 0) return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 })
    if (categories.some((category, categoryIndex) => categoryIndex !== index && category.name.toLocaleLowerCase('vi-VN') === name.toLocaleLowerCase('vi-VN'))) return NextResponse.json({ error: 'Danh mục đã tồn tại' }, { status: 409 })
    const previousName = categories[index].name
    const updated = { ...categories[index], name, slug: sanitizeNoticeCategory({ name }, id, categories[index].sortOrder)?.slug || categories[index].slug }
    const nextCategories = categories.map((category, categoryIndex) => categoryIndex === index ? updated : category)
    if (hasDatabase()) {
      await getAdminDb().$transaction([
        getAdminDb().pageContent.upsert({ where: { pageKey: NOTICE_CATEGORIES_PAGE_KEY }, update: { title: 'Danh mục niêm yết', content: 'Danh mục được quản lý trong CMS.', metadata: { items: nextCategories }, isActive: true }, create: { pageKey: NOTICE_CATEGORIES_PAGE_KEY, title: 'Danh mục niêm yết', content: 'Danh mục được quản lý trong CMS.', metadata: { items: nextCategories }, isActive: true } }),
        getAdminDb().publicNotice.updateMany({ where: { category: previousName }, data: { category: name } }),
      ])
    } else {
      const notices = readFallbackNotices().map((notice) => notice.category === previousName ? { ...notice, category: name } : notice)
      writeFileSync(NOTICE_FILE, JSON.stringify(notices, null, 2), 'utf-8')
      writeNoticeCategoriesFile(nextCategories)
    }
    await writeAuditLog({ ...auth.session, action: 'UPDATE', entity: 'public_notice_category', entityId: id, details: { from: previousName, name } })
    const usage = await getUsageCounts()
    return NextResponse.json({ success: true, item: { ...updated, usedCount: usage.get(name) || 0 } })
  } catch (error) {
    console.error('[Admin/PublicNoticeCategories] Lỗi cập nhật:', error)
    return NextResponse.json({ error: 'Không thể cập nhật danh mục' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response
    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    if (!id) return NextResponse.json({ error: 'Thiếu ID danh mục' }, { status: 400 })
    const categories = await readCategories()
    const category = categories.find((item) => item.id === id)
    if (!category) return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 })
    const usage = await getUsageCounts()
    if ((usage.get(category.name) || 0) > 0) return NextResponse.json({ error: `Không thể xóa: danh mục đang được dùng cho ${usage.get(category.name)} niêm yết` }, { status: 409 })
    await writeCategories(categories.filter((item) => item.id !== id))
    await writeAuditLog({ ...auth.session, action: 'DELETE', entity: 'public_notice_category', entityId: id, details: { name: category.name } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin/PublicNoticeCategories] Lỗi xóa:', error)
    return NextResponse.json({ error: 'Không thể xóa danh mục' }, { status: 500 })
  }
}
