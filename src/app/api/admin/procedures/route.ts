/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD thủ tục hành chính — đọc/tạo/sửa/xóa lĩnh vực + thủ tục con
 * @lienquan    : data/procedures.json, src/lib/static-data.ts
 * @alias       : admin-procedures-api, crud-thu-tuc
 *
 * Hiện tại đọc/ghi từ file JSON (dev mode).
 * Khi kết nối DB sẽ chuyển sang Prisma queries.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const PROC_FILE = join(process.cwd(), 'data', 'procedures.json')

// Kiểu dữ liệu lĩnh vực
interface CategoryItem {
  id: string
  name: string
  type: string
  slug: string
  description: string
  subCategories: string[]
  documents?: Array<{ title: string; type: string; preview: string; pdf: string; pageCount: number }>
}

// Kiểu dữ liệu file procedures.json
interface ProceduresFile {
  metadata: Record<string, unknown>
  categories: CategoryItem[]
  phiDiaGioi: Array<Record<string, unknown>>
  thuongGap: Array<Record<string, unknown>>
  externalLinks: Record<string, unknown>
  contactInfo: Record<string, unknown>
}

// Đọc dữ liệu từ JSON
function readProcedures(): ProceduresFile {
  try {
    const raw = readFileSync(PROC_FILE, 'utf-8')
    return JSON.parse(raw) as ProceduresFile
  } catch {
    return {
      metadata: {}, categories: [], phiDiaGioi: [],
      thuongGap: [], externalLinks: {}, contactInfo: {},
    }
  }
}

// Ghi dữ liệu ra JSON
function writeProcedures(data: ProceduresFile) {
  writeFileSync(PROC_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// Tạo slug từ tên
function generateSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** GET — Lấy danh sách lĩnh vực + thủ tục */
export async function GET() {
  const data = readProcedures()
  return NextResponse.json({
    categories: data.categories,
    phiDiaGioi: data.phiDiaGioi,
    thuongGap: data.thuongGap,
    total: data.categories.length,
  })
}

/** POST — Tạo lĩnh vực mới hoặc thêm thủ tục con */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = readProcedures()

    // Trường hợp 1: Thêm thủ tục con vào lĩnh vực hiện có
    if (body.action === 'add-procedure' && body.categoryId && body.procedureName) {
      const cat = data.categories.find((c) => c.id === body.categoryId)
      if (!cat) {
        return NextResponse.json({ error: 'Không tìm thấy lĩnh vực' }, { status: 404 })
      }
      if (!cat.subCategories.includes(body.procedureName.trim())) {
        cat.subCategories.push(body.procedureName.trim())
      }
      writeProcedures(data)
      return NextResponse.json({ success: true, category: cat })
    }

    // Trường hợp 2: Tạo lĩnh vực mới
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Tên lĩnh vực là bắt buộc' }, { status: 400 })
    }

    const newCategory: CategoryItem = {
      id: `cat-${String(data.categories.length + 1).padStart(2, '0')}`,
      name: body.name.trim(),
      type: body.type || 'cap-phuong',
      slug: body.slug || generateSlug(body.name),
      description: body.description?.trim() || '',
      subCategories: body.subCategories || [],
    }

    data.categories.push(newCategory)
    // Cập nhật metadata
    data.metadata.totalCategories = data.categories.length
    data.metadata.totalSubCategories = data.categories.reduce(
      (sum, c) => sum + c.subCategories.length, 0
    )
    writeProcedures(data)

    return NextResponse.json({ success: true, category: newCategory })
  } catch (err) {
    console.error('[Admin/Procedures] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo lĩnh vực/thủ tục' }, { status: 500 })
  }
}

/** PUT — Cập nhật lĩnh vực */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID lĩnh vực' }, { status: 400 })
    }

    const data = readProcedures()
    const index = data.categories.findIndex((c) => c.id === body.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy lĩnh vực' }, { status: 404 })
    }

    // Cập nhật các trường
    data.categories[index] = {
      ...data.categories[index],
      name: body.name?.trim() || data.categories[index].name,
      slug: body.slug || data.categories[index].slug,
      description: body.description?.trim() ?? data.categories[index].description,
      subCategories: body.subCategories || data.categories[index].subCategories,
    }

    // Cập nhật metadata
    data.metadata.totalSubCategories = data.categories.reduce(
      (sum, c) => sum + c.subCategories.length, 0
    )
    writeProcedures(data)

    return NextResponse.json({ success: true, category: data.categories[index] })
  } catch (err) {
    console.error('[Admin/Procedures] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật lĩnh vực' }, { status: 500 })
  }
}

/** DELETE — Xóa lĩnh vực hoặc thủ tục con */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
    }

    const data = readProcedures()

    // Xóa thủ tục con cụ thể
    if (body.action === 'remove-procedure' && body.procedureName) {
      const cat = data.categories.find((c) => c.id === body.id)
      if (!cat) {
        return NextResponse.json({ error: 'Không tìm thấy lĩnh vực' }, { status: 404 })
      }
      cat.subCategories = cat.subCategories.filter((s) => s !== body.procedureName)
      data.metadata.totalSubCategories = data.categories.reduce(
        (sum, c) => sum + c.subCategories.length, 0
      )
      writeProcedures(data)
      return NextResponse.json({ success: true })
    }

    // Xóa toàn bộ lĩnh vực
    const filtered = data.categories.filter((c) => c.id !== body.id)
    if (filtered.length === data.categories.length) {
      return NextResponse.json({ error: 'Không tìm thấy lĩnh vực' }, { status: 404 })
    }

    data.categories = filtered
    data.metadata.totalCategories = data.categories.length
    data.metadata.totalSubCategories = data.categories.reduce(
      (sum, c) => sum + c.subCategories.length, 0
    )
    writeProcedures(data)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/Procedures] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa lĩnh vực/thủ tục' }, { status: 500 })
  }
}
