/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Upload file/video cho CMS tuyên truyền lên ổ đĩa server
 * @lienquan    : src/app/uploads/[...path]/route.ts
 * @alias       : admin-upload-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { createWriteStream } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { extname, join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import type { ReadableStream as NodeReadableStream } from 'stream/web'
import { requireAdminSession } from '@/lib/admin-auth'
import { extractWorkScheduleFromPdf } from '@/lib/work-schedule-pdf'

const MAX_UPLOAD_SIZE = 300 * 1024 * 1024
const DEFAULT_ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']
const NOTICE_ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf']
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.mov', '.pdf'])
const NOTICE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.pdf'])
const PDF_EXTENSIONS = new Set(['.pdf'])
const PDF_ONLY_FOLDERS = new Set(['lich-cong-tac', 'van-ban'])
const ALLOWED_FOLDERS = new Set(['tin-tuc', 'tuyen-truyen', 'chuyen-doi-so', 'lich-cong-tac', 'niem-yet', 'van-ban'])
const DEFAULT_UPLOAD_DIR = '/tmp/xuanhoa-uploads'

export const runtime = 'nodejs'

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

function getUploadFolder(value: FormDataEntryValue | null) {
  if (typeof value === 'string' && ALLOWED_FOLDERS.has(value)) return value
  return 'tuyen-truyen'
}

function getAllowedExtensions(folder: string) {
  if (PDF_ONLY_FOLDERS.has(folder)) return PDF_EXTENSIONS
  if (folder === 'niem-yet') return NOTICE_EXTENSIONS
  return ALLOWED_EXTENSIONS
}

function getAllowedMimePrefixes(folder: string) {
  if (PDF_ONLY_FOLDERS.has(folder)) return ['application/pdf']
  if (folder === 'niem-yet') return NOTICE_ALLOWED_MIME_PREFIXES
  return DEFAULT_ALLOWED_MIME_PREFIXES
}

function getUnsupportedFormatMessage(folder: string) {
  if (folder === 'lich-cong-tac') return 'Lịch công tác chỉ hỗ trợ PDF'
  if (folder === 'van-ban') return 'Văn bản chỉ hỗ trợ PDF'
  if (folder === 'niem-yet') return 'Niêm yết chỉ hỗ trợ ảnh hoặc PDF'
  return 'Chỉ hỗ trợ ảnh, video hoặc PDF'
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = getUploadFolder(formData.get('folder'))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Thiếu tệp tải lên' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'Tệp vượt quá dung lượng 300MB' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (file.type === 'image/svg+xml' || extension === '.svg') {
      return NextResponse.json({ error: 'Không hỗ trợ SVG' }, { status: 400 })
    }

    const allowedExtensions = getAllowedExtensions(folder)
    if (!allowedExtensions.has(extension)) {
      return NextResponse.json({ error: 'Định dạng tệp không được hỗ trợ' }, { status: 400 })
    }

    const allowedMimePrefixes = getAllowedMimePrefixes(folder)
    const allowed = allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix))
    if (!allowed) {
      return NextResponse.json({ error: getUnsupportedFormatMessage(folder) }, { status: 400 })
    }

    const fileName = safeFileName(file.name)
    const uploadDir = join(getUploadDir(), folder)
    const filePath = join(uploadDir, fileName)

    await mkdir(uploadDir, { recursive: true })

    try {
      await pipeline(
        Readable.fromWeb(file.stream() as unknown as NodeReadableStream<Uint8Array>),
        createWriteStream(filePath)
      )
    } catch (err) {
      await rm(filePath, { force: true })
      throw err
    }

    const workSchedule = folder === 'lich-cong-tac'
      ? await extractWorkScheduleFromPdf(filePath)
      : null

    return NextResponse.json({
      success: true,
      url: `/uploads/${folder}/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      workSchedule,
    })
  } catch (err) {
    console.error('[Admin/Uploads] Lỗi upload:', err)
    return NextResponse.json({ error: 'Lỗi tải tệp lên' }, { status: 500 })
  }
}
