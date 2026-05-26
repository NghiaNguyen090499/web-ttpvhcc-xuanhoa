/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Upload file/video cho CMS tuyên truyền lên Supabase Storage
 * @lienquan    : @supabase/supabase-js
 * @alias       : admin-upload-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extname } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']
const DEFAULT_BUCKET = 'portal-uploads'

function getStorageClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

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

    const storage = getStorageClient()
    if (!storage) {
      return NextResponse.json(
        { error: 'Chưa cấu hình Supabase Storage' },
        { status: 503 }
      )
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET
    const fileName = safeFileName(file.name)
    const filePath = `tuyen-truyen/${fileName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await storage.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error('[Admin/Uploads] Supabase Storage:', error)
      return NextResponse.json({ error: 'Không thể lưu tệp lên storage' }, { status: 500 })
    }

    const { data } = storage.storage.from(bucket).getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (err) {
    console.error('[Admin/Uploads] Lỗi upload:', err)
    return NextResponse.json({ error: 'Lỗi tải tệp lên' }, { status: 500 })
  }
}
