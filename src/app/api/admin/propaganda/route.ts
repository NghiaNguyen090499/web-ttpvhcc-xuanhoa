/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD nội dung Video/File/Tuyên truyền
 * @lienquan    : data/tuyen-truyen.json, src/lib/static-data.ts
 * @alias       : admin-propaganda-api, crud-tuyen-truyen
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'

const PROPAGANDA_FILE = join(process.cwd(), 'data', 'tuyen-truyen.json')

type PropagandaItem = {
  id: string
  icon: string
  tag: string
  tagColor: string
  title: string
  summary: string
  content: string
  publishedAt: string
  mediaType?: 'article' | 'video' | 'file'
  mediaUrl?: string
  fileName?: string
  fileSize?: number
}

function readItems(): PropagandaItem[] {
  try {
    const raw = readFileSync(PROPAGANDA_FILE, 'utf-8')
    return JSON.parse(raw) as PropagandaItem[]
  } catch {
    return []
  }
}

function writeItems(items: PropagandaItem[]) {
  writeFileSync(PROPAGANDA_FILE, JSON.stringify(items, null, 2), 'utf-8')
}

function normalizeMediaType(value: unknown): PropagandaItem['mediaType'] {
  if (value === 'video' || value === 'file') return value
  return 'article'
}

function buildItem(body: Record<string, unknown>, fallback?: PropagandaItem): PropagandaItem {
  const title = String(body.title || fallback?.title || '').trim()
  const content = String(body.content || fallback?.content || '').trim()
  const summary = String(body.summary || fallback?.summary || '').trim()
  const mediaUrl = String(body.mediaUrl || fallback?.mediaUrl || '').trim()

  return {
    id: fallback?.id || `tt-${Date.now()}`,
    icon: String(body.icon || fallback?.icon || '📢'),
    tag: String(body.tag || fallback?.tag || 'Tuyên truyền').trim(),
    tagColor: String(body.tagColor || fallback?.tagColor || 'blue'),
    title,
    summary: summary || title,
    content: content || summary || title,
    publishedAt: String(body.publishedAt || fallback?.publishedAt || new Date().toISOString().slice(0, 10)),
    mediaType: normalizeMediaType(body.mediaType || fallback?.mediaType),
    mediaUrl: mediaUrl || undefined,
    fileName: body.fileName ? String(body.fileName) : fallback?.fileName,
    fileSize: typeof body.fileSize === 'number' ? body.fileSize : fallback?.fileSize,
  }
}

export async function GET() {
  const items = readItems()
  return NextResponse.json({ items, total: items.length })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 })
    }

    const items = readItems()
    const item = buildItem(body)
    items.unshift(item)
    writeItems(items)

    return NextResponse.json({ success: true, item })
  } catch (err) {
    console.error('[Admin/Propaganda] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo nội dung tuyên truyền' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID nội dung' }, { status: 400 })
    }

    const items = readItems()
    const index = items.findIndex((item) => item.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy nội dung' }, { status: 404 })
    }

    items[index] = buildItem(body, items[index])
    writeItems(items)

    return NextResponse.json({ success: true, item: items[index] })
  } catch (err) {
    console.error('[Admin/Propaganda] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật nội dung tuyên truyền' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('ADMIN')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID nội dung' }, { status: 400 })
    }

    const items = readItems()
    const filtered = items.filter((item) => item.id !== body.id)
    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Không tìm thấy nội dung' }, { status: 404 })
    }

    writeItems(filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/Propaganda] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa nội dung tuyên truyền' }, { status: 500 })
  }
}
