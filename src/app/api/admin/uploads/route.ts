/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Upload file/video cho CMS tuyên truyền lên ổ đĩa server
 * @lienquan    : src/app/uploads/[...path]/route.ts
 * @alias       : admin-upload-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']
const DEFAULT_UPLOAD_DIR = '/tmp/xuanhoa-uploads'

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

function getUploadDir() {
  return process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR
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

    const fileName = safeFileName(file.name)
    const folder = 'tuyen-truyen'
    const uploadDir = join(getUploadDir(), folder)
    const filePath = join(uploadDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())

    await mkdir(uploadDir, { recursive: true })
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${folder}/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (err) {
    console.error('[Admin/Uploads] Lỗi upload:', err)
    return NextResponse.json({ error: 'Lỗi tải tệp lên' }, { status: 500 })
  }
}
