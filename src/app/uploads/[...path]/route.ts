/**
 * @nhom        : API Routes / Uploads
 * @chucnang    : Phục vụ file CMS đã upload từ ổ đĩa server
 * @lienquan    : src/app/api/admin/uploads/route.ts
 * @alias       : uploaded-files-route
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { extname, normalize, resolve } from 'path'

const DEFAULT_UPLOAD_DIR = '/tmp/xuanhoa-uploads'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
}

function getUploadDir() {
  return process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR
}

function getSafePath(parts: string[]) {
  const baseDir = resolve(getUploadDir())
  const relativePath = normalize(parts.join('/')).replace(/^(\.\.(\/|\\|$))+/, '')
  const fullPath = resolve(baseDir, relativePath)

  if (!fullPath.startsWith(baseDir)) {
    return null
  }

  return fullPath
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const filePath = getSafePath(path || [])

  if (!filePath) {
    return NextResponse.json({ error: 'Đường dẫn không hợp lệ' }, { status: 400 })
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 })
    }

    const file = await readFile(filePath)
    const contentType = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 })
  }
}
