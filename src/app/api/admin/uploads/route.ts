/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Upload file/video cho CMS tuyên truyền
 * @lienquan    : public/uploads/tuyen-truyen
 * @alias       : admin-upload-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { extname, join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'tuyen-truyen')
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']

function safeFileName(name: string) {
  const extension = extname(name).toLowerCase()
  const base = name
    .replace(extension, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)

  return `${base || 'file'}-${Date.now()}${extension}`
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Thiếu tệp tải lên' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'Tệp vượt quá dung lượng 50MB' }, { status: 400 })
    }

    const allowed = ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))
    if (!allowed) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ ảnh, video hoặc PDF' }, { status: 400 })
    }

    mkdirSync(UPLOAD_DIR, { recursive: true })
    const fileName = safeFileName(file.name)
    const bytes = Buffer.from(await file.arrayBuffer())
    writeFileSync(join(UPLOAD_DIR, fileName), bytes)

    return NextResponse.json({
      success: true,
      url: `/uploads/tuyen-truyen/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (err) {
    console.error('[Admin/Uploads] Lỗi upload:', err)
    return NextResponse.json({ error: 'Lỗi tải tệp lên' }, { status: 500 })
  }
}
