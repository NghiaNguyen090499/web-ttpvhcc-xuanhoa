/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD văn bản chỉ đạo điều hành bằng PostgreSQL, fallback JSON khi dev chưa có DB
 * @lienquan    : prisma/schema.prisma, data/van-ban.json
 * @alias       : admin-directive-documents-api, crud-van-ban
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'

const DOC_FILE = join(process.cwd(), 'data', 'van-ban.json')

type DirectiveItem = {
  id: string
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

function readItems(): DirectiveItem[] {
  try {
    return JSON.parse(readFileSync(DOC_FILE, 'utf-8')) as DirectiveItem[]
  } catch {
    return []
  }
}

function writeItems(items: DirectiveItem[]) {
  writeFileSync(DOC_FILE, JSON.stringify(items, null, 2), 'utf-8')
}

function buildItem(body: Record<string, unknown>, fallback?: DirectiveItem): DirectiveItem {
  return {
    id: fallback?.id || `vb-${Date.now()}`,
    soKyHieu: String(body.soKyHieu || fallback?.soKyHieu || '').trim(),
    loai: String(body.loai || fallback?.loai || 'Công văn').trim(),
    trichYeu: String(body.trichYeu || fallback?.trichYeu || '').trim(),
    ngayBanHanh: String(body.ngayBanHanh || fallback?.ngayBanHanh || new Date().toISOString().slice(0, 10)),
    coQuanBanHanh: String(body.coQuanBanHanh || fallback?.coQuanBanHanh || 'UBND Phường Xuân Hòa').trim(),
    nguoiKy: String(body.nguoiKy || fallback?.nguoiKy || '').trim(),
    linhVuc: String(body.linhVuc || fallback?.linhVuc || 'Hành chính').trim(),
    fileUrl: String(body.fileUrl || fallback?.fileUrl || '').trim(),
    trangThai: String(body.trangThai || fallback?.trangThai || 'Có hiệu lực').trim(),
  }
}

export async function GET() {
  if (hasDatabase()) {
    const docs = await getAdminDb().directiveDocument.findMany({
      orderBy: [{ ngayBanHanh: 'desc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({
      items: docs.map((item) => ({
        id: item.id,
        soKyHieu: item.soKyHieu,
        loai: item.loai,
        trichYeu: item.trichYeu,
        ngayBanHanh: item.ngayBanHanh.toISOString().slice(0, 10),
        coQuanBanHanh: item.coQuanBanHanh,
        nguoiKy: item.nguoiKy,
        linhVuc: item.linhVuc,
        fileUrl: item.fileUrl,
        trangThai: item.trangThai,
      })),
      total: docs.length,
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
    if (!body.soKyHieu?.trim() || !body.trichYeu?.trim() || !body.fileUrl?.trim()) {
      return NextResponse.json({ error: 'Số ký hiệu, trích yếu và file là bắt buộc' }, { status: 400 })
    }

    const item = buildItem(body)
    if (hasDatabase()) {
      const created = await getAdminDb().directiveDocument.create({
        data: {
          soKyHieu: item.soKyHieu,
          loai: item.loai,
          trichYeu: item.trichYeu,
          ngayBanHanh: new Date(`${item.ngayBanHanh}T00:00:00.000Z`),
          coQuanBanHanh: item.coQuanBanHanh,
          nguoiKy: item.nguoiKy,
          linhVuc: item.linhVuc,
          fileUrl: item.fileUrl,
          trangThai: item.trangThai,
        },
      })
      await writeAuditLog({ ...auth.session, action: 'CREATE', entity: 'directive_document', entityId: created.id, details: { soKyHieu: created.soKyHieu } })
      return NextResponse.json({ success: true, item: created })
    }

    const items = readItems()
    items.unshift(item)
    writeItems(items)
    return NextResponse.json({ success: true, item })
  } catch (err) {
    console.error('[Admin/DirectiveDocuments] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo văn bản' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID văn bản' }, { status: 400 })

    if (hasDatabase()) {
      const existing = await getAdminDb().directiveDocument.findUnique({ where: { id: String(body.id) } })
      if (!existing) return NextResponse.json({ error: 'Không tìm thấy văn bản' }, { status: 404 })
      const item = buildItem(body, {
        id: existing.id,
        soKyHieu: existing.soKyHieu,
        loai: existing.loai,
        trichYeu: existing.trichYeu,
        ngayBanHanh: existing.ngayBanHanh.toISOString().slice(0, 10),
        coQuanBanHanh: existing.coQuanBanHanh,
        nguoiKy: existing.nguoiKy,
        linhVuc: existing.linhVuc,
        fileUrl: existing.fileUrl,
        trangThai: existing.trangThai,
      })
      const updated = await getAdminDb().directiveDocument.update({
        where: { id: String(body.id) },
        data: {
          soKyHieu: item.soKyHieu,
          loai: item.loai,
          trichYeu: item.trichYeu,
          ngayBanHanh: new Date(`${item.ngayBanHanh}T00:00:00.000Z`),
          coQuanBanHanh: item.coQuanBanHanh,
          nguoiKy: item.nguoiKy,
          linhVuc: item.linhVuc,
          fileUrl: item.fileUrl,
          trangThai: item.trangThai,
        },
      })
      await writeAuditLog({ ...auth.session, action: 'UPDATE', entity: 'directive_document', entityId: updated.id, details: { soKyHieu: updated.soKyHieu } })
      return NextResponse.json({ success: true, item: updated })
    }

    const items = readItems()
    const index = items.findIndex((item) => item.id === body.id)
    if (index === -1) return NextResponse.json({ error: 'Không tìm thấy văn bản' }, { status: 404 })
    items[index] = buildItem(body, items[index])
    writeItems(items)
    return NextResponse.json({ success: true, item: items[index] })
  } catch (err) {
    console.error('[Admin/DirectiveDocuments] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật văn bản' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('ADMIN')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID văn bản' }, { status: 400 })

    if (hasDatabase()) {
      await getAdminDb().directiveDocument.delete({ where: { id: String(body.id) } })
      await writeAuditLog({ ...auth.session, action: 'DELETE', entity: 'directive_document', entityId: String(body.id) })
      return NextResponse.json({ success: true })
    }

    const items = readItems()
    const filtered = items.filter((item) => item.id !== body.id)
    if (filtered.length === items.length) return NextResponse.json({ error: 'Không tìm thấy văn bản' }, { status: 404 })
    writeItems(filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/DirectiveDocuments] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa văn bản' }, { status: 500 })
  }
}
