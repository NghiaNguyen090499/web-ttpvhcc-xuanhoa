/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD niêm yết công khai bằng PostgreSQL, fallback JSON khi dev chưa có DB
 * @lienquan    : prisma/schema.prisma, data/niem-yet.json
 * @alias       : admin-public-notices-api, crud-niem-yet
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'

const NOTICE_FILE = join(process.cwd(), 'data', 'niem-yet.json')

type PublicNoticeItem = {
  id: string
  title: string
  category?: string
  fileUrl: string
  attachments?: NoticeAttachment[]
  fileType?: string
  publishedAt: string
  description?: string
}

type NoticeAttachment = { url: string; name?: string; fileType?: string }

function sanitizeAttachments(value: unknown, fallback?: NoticeAttachment[]): NoticeAttachment[] | undefined {
  const source = Array.isArray(value) ? value : fallback
  if (!source) return undefined
  const items = source.map((attachment) => {
    if (typeof attachment === 'string') return { url: attachment.trim() }
    if (!attachment || typeof attachment !== 'object') return null
    const raw = attachment as Record<string, unknown>
    const url = typeof raw.url === 'string' ? raw.url.trim() : ''
    if (!url) return null
    return {
      url,
      name: typeof raw.name === 'string' ? raw.name.trim().slice(0, 180) || undefined : undefined,
      fileType: typeof raw.fileType === 'string' ? raw.fileType.trim() || undefined : undefined,
    }
  }).filter(Boolean) as NoticeAttachment[]
  return items.length ? items : undefined
}

function readItems(): PublicNoticeItem[] {
  try {
    return JSON.parse(readFileSync(NOTICE_FILE, 'utf-8')) as PublicNoticeItem[]
  } catch {
    return []
  }
}

function writeItems(items: PublicNoticeItem[]) {
  writeFileSync(NOTICE_FILE, JSON.stringify(items, null, 2), 'utf-8')
}

function revalidateNoticePages() {
  revalidatePath('/')
  revalidatePath('/niem-yet')
  revalidatePath('/tim-kiem')
}

function buildItem(body: Record<string, unknown>, fallback?: PublicNoticeItem): PublicNoticeItem {
  const title = String(body.title || fallback?.title || '').trim()
  const fileUrl = String(body.fileUrl || fallback?.fileUrl || '').trim()
  const attachments = sanitizeAttachments(body.attachments, fallback?.attachments)

  return {
    id: fallback?.id || `ny-${Date.now()}`,
    title,
    category: String(body.category || fallback?.category || '').trim() || undefined,
    fileUrl,
    attachments,
    fileType: String(body.fileType || fallback?.fileType || 'pdf').trim(),
    publishedAt: String(body.publishedAt || fallback?.publishedAt || new Date().toISOString().slice(0, 10)),
    description: String(body.description || fallback?.description || '').trim() || undefined,
  }
}

export async function GET() {
  if (hasDatabase()) {
    const notices = await getAdminDb().publicNotice.findMany({
      orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({
      items: notices.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        fileUrl: item.fileUrl,
        attachments: item.attachments,
        fileType: item.fileType,
        publishedAt: item.publishedAt.toISOString().slice(0, 10),
        description: item.description,
      })),
      total: notices.length,
    })
  }

  const items = readItems()
  return NextResponse.json({ items, total: items.length })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.title?.trim() || !body.fileUrl?.trim()) {
      return NextResponse.json({ error: 'Tiêu đề và file là bắt buộc' }, { status: 400 })
    }

    const item = buildItem(body)
    if (hasDatabase()) {
      const created = await getAdminDb().publicNotice.create({
        data: {
          title: item.title,
          category: item.category,
          fileUrl: item.fileUrl,
          attachments: item.attachments,
          fileType: item.fileType || 'pdf',
          publishedAt: new Date(`${item.publishedAt}T00:00:00.000Z`),
          description: item.description,
        },
      })
      await writeAuditLog({ ...auth.session, action: 'CREATE', entity: 'public_notice', entityId: created.id, details: { title: created.title } })
      revalidateNoticePages()
      return NextResponse.json({ success: true, item: created })
    }

    const items = readItems()
    items.unshift(item)
    writeItems(items)
    revalidateNoticePages()
    return NextResponse.json({ success: true, item })
  } catch (err) {
    console.error('[Admin/PublicNotices] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo niêm yết' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID niêm yết' }, { status: 400 })

    if (hasDatabase()) {
      const existing = await getAdminDb().publicNotice.findUnique({ where: { id: String(body.id) } })
      if (!existing) return NextResponse.json({ error: 'Không tìm thấy niêm yết' }, { status: 404 })
      const item = buildItem(body, {
        id: existing.id,
        title: existing.title,
        category: existing.category || undefined,
        fileUrl: existing.fileUrl,
        attachments: sanitizeAttachments(existing.attachments),
        fileType: existing.fileType,
        publishedAt: existing.publishedAt.toISOString().slice(0, 10),
        description: existing.description || undefined,
      })
      const updated = await getAdminDb().publicNotice.update({
        where: { id: String(body.id) },
        data: {
          title: item.title,
          category: item.category,
          fileUrl: item.fileUrl,
          attachments: item.attachments,
          fileType: item.fileType || 'pdf',
          publishedAt: new Date(`${item.publishedAt}T00:00:00.000Z`),
          description: item.description,
        },
      })
      await writeAuditLog({ ...auth.session, action: 'UPDATE', entity: 'public_notice', entityId: updated.id, details: { title: updated.title } })
      revalidateNoticePages()
      return NextResponse.json({ success: true, item: updated })
    }

    const items = readItems()
    const index = items.findIndex((item) => item.id === body.id)
    if (index === -1) return NextResponse.json({ error: 'Không tìm thấy niêm yết' }, { status: 404 })
    items[index] = buildItem(body, items[index])
    writeItems(items)
    revalidateNoticePages()
    return NextResponse.json({ success: true, item: items[index] })
  } catch (err) {
    console.error('[Admin/PublicNotices] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật niêm yết' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID niêm yết' }, { status: 400 })

    if (hasDatabase()) {
      await getAdminDb().publicNotice.delete({ where: { id: String(body.id) } })
      await writeAuditLog({ ...auth.session, action: 'DELETE', entity: 'public_notice', entityId: String(body.id) })
      revalidateNoticePages()
      return NextResponse.json({ success: true })
    }

    const items = readItems()
    const filtered = items.filter((item) => item.id !== body.id)
    if (filtered.length === items.length) return NextResponse.json({ error: 'Không tìm thấy niêm yết' }, { status: 404 })
    writeItems(filtered)
    revalidateNoticePages()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/PublicNotices] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa niêm yết' }, { status: 500 })
  }
}
