import { randomUUID } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import {
  FOOD_PLACES_FILE,
  FOOD_PLACES_PAGE_KEY,
  getStaticFoodPlacesContent,
  sanitizeFoodPlace,
  sanitizeFoodPlacesContent,
} from '@/lib/food-places'
import type { FoodPlacesContent } from '@/types/food-place'
import { crawlXuanHoaFoodPlaces } from '@/lib/osm-food-crawler'

export const runtime = 'nodejs'

async function readContent(): Promise<FoodPlacesContent> {
  if (!hasDatabase()) return getStaticFoodPlacesContent()

  const content = await getAdminDb().pageContent.findUnique({
    where: { pageKey: FOOD_PLACES_PAGE_KEY },
    select: { metadata: true },
  })
  return content?.metadata
    ? sanitizeFoodPlacesContent(content.metadata)
    : getStaticFoodPlacesContent()
}

async function writeContent(content: FoodPlacesContent) {
  if (hasDatabase()) {
    await getAdminDb().pageContent.upsert({
      where: { pageKey: FOOD_PLACES_PAGE_KEY },
      update: {
        title: 'Ẩm thực Xuân Hòa',
        content: 'Danh sách địa điểm ẩm thực được biên tập thủ công trong CMS.',
        metadata: content as unknown as object,
        isActive: true,
      },
      create: {
        pageKey: FOOD_PLACES_PAGE_KEY,
        title: 'Ẩm thực Xuân Hòa',
        content: 'Danh sách địa điểm ẩm thực được biên tập thủ công trong CMS.',
        metadata: content as unknown as object,
        isActive: true,
      },
    })
    return
  }

  // Đọc trước để tránh ghi nhầm nếu file đang hỏng hoặc không truy cập được.
  readFileSync(FOOD_PLACES_FILE, 'utf-8')
  writeFileSync(FOOD_PLACES_FILE, JSON.stringify(content, null, 2), 'utf-8')
}

function withUpdatedDate(content: FoodPlacesContent): FoodPlacesContent {
  return { ...content, updatedAt: new Date().toISOString().slice(0, 10) }
}

export async function GET() {
  try {
    const content = await readContent()
    return NextResponse.json({ ...content, total: content.items.length })
  } catch (error) {
    console.error('[Admin/FoodPlaces] Lỗi tải:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách ẩm thực' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (body.action === 'import-osm') {
      const content = await readContent()
      const crawled = await crawlXuanHoaFoodPlaces()
      const existingIds = new Set(content.items.map((item) => item.id))
      const imported = crawled.filter((item) => !existingIds.has(item.id))
      const nextContent = withUpdatedDate({ ...content, items: [...content.items, ...imported] })
      if (imported.length > 0) await writeContent(nextContent)

      await writeAuditLog({
        ...auth.session,
        action: 'IMPORT',
        entity: 'food-place',
        details: { source: 'OpenStreetMap', found: crawled.length, imported: imported.length },
      })

      return NextResponse.json({
        success: true,
        found: crawled.length,
        imported: imported.length,
        skipped: crawled.length - imported.length,
        updatedAt: nextContent.updatedAt,
      })
    }

    const item = sanitizeFoodPlace({ ...body, id: `food-${randomUUID()}` })
    if (!item) {
      return NextResponse.json({ error: 'Thông tin địa điểm chưa hợp lệ. Kiểm tra các trường bắt buộc và liên kết Google Maps.' }, { status: 400 })
    }

    const content = await readContent()
    const nextContent = withUpdatedDate({ ...content, items: [item, ...content.items] })
    await writeContent(nextContent)
    await writeAuditLog({
      ...auth.session,
      action: 'CREATE',
      entity: 'food-place',
      entityId: item.id,
      details: { name: item.name },
    })

    return NextResponse.json({ success: true, item, updatedAt: nextContent.updatedAt })
  } catch (error) {
    console.error('[Admin/FoodPlaces] Lỗi tạo:', error)
    return NextResponse.json({ error: 'Không thể tạo địa điểm ẩm thực' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    if (!id) return NextResponse.json({ error: 'Thiếu ID địa điểm' }, { status: 400 })

    const content = await readContent()
    const existingIndex = content.items.findIndex((item) => item.id === id)
    if (existingIndex < 0) return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })

    const item = sanitizeFoodPlace({ ...content.items[existingIndex], ...body, id }, id)
    if (!item) {
      return NextResponse.json({ error: 'Thông tin địa điểm chưa hợp lệ. Kiểm tra các trường bắt buộc và liên kết Google Maps.' }, { status: 400 })
    }

    const items = [...content.items]
    items[existingIndex] = item
    const nextContent = withUpdatedDate({ ...content, items })
    await writeContent(nextContent)
    await writeAuditLog({
      ...auth.session,
      action: 'UPDATE',
      entity: 'food-place',
      entityId: item.id,
      details: { name: item.name },
    })

    return NextResponse.json({ success: true, item, updatedAt: nextContent.updatedAt })
  } catch (error) {
    console.error('[Admin/FoodPlaces] Lỗi cập nhật:', error)
    return NextResponse.json({ error: 'Không thể cập nhật địa điểm ẩm thực' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('ADMIN')
    if (auth.response) return auth.response

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    if (!id) return NextResponse.json({ error: 'Thiếu ID địa điểm' }, { status: 400 })

    const content = await readContent()
    const existing = content.items.find((item) => item.id === id)
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy địa điểm' }, { status: 404 })

    const nextContent = withUpdatedDate({
      ...content,
      items: content.items.filter((item) => item.id !== id),
    })
    await writeContent(nextContent)
    await writeAuditLog({
      ...auth.session,
      action: 'DELETE',
      entity: 'food-place',
      entityId: id,
      details: { name: existing.name },
    })

    return NextResponse.json({ success: true, updatedAt: nextContent.updatedAt })
  } catch (error) {
    console.error('[Admin/FoodPlaces] Lỗi xóa:', error)
    return NextResponse.json({ error: 'Không thể xóa địa điểm ẩm thực' }, { status: 500 })
  }
}
