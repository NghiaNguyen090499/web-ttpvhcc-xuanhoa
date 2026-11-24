/**
 * @nhom        : API Routes / Uploads
 * @chucnang    : Phục vụ file CMS đã upload từ ổ đĩa server
 * @lienquan    : src/app/api/admin/uploads/route.ts
 * @alias       : uploaded-files-route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { extname, relative, resolve, sep } from 'path'

const DEFAULT_UPLOAD_DIR = '/tmp/xuanhoa-uploads'
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

export const runtime = 'nodejs'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
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
  const relativePath = parts.join('/')
  const fullPath = resolve(baseDir, relativePath)
  const baseDirPrefix = baseDir.endsWith(sep) ? baseDir : `${baseDir}${sep}`

  if (fullPath !== baseDir && !fullPath.startsWith(baseDirPrefix)) {
    return null
  }

  // Thư mục/tệp bắt đầu bằng "_" (vd: _private/phan-anh) là riêng tư — không phục vụ công khai
  if (relative(baseDir, fullPath).split(sep).some((part) => part.startsWith('_'))) {
    return null
  }

  return fullPath
}

function getContentType(filePath: string) {
  return MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function parseRange(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader) return null
  if (!rangeHeader.startsWith('bytes=') || rangeHeader.includes(',')) return 'invalid'

  const range = rangeHeader.slice('bytes='.length).trim()
  const [startValue, endValue, extra] = range.split('-')
  if (extra !== undefined) return 'invalid'

  let start: number
  let end: number

  if (startValue === '') {
    const suffixLength = Number(endValue)
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return 'invalid'

    start = Math.max(fileSize - suffixLength, 0)
    end = fileSize - 1
  } else {
    start = Number(startValue)
    if (!Number.isInteger(start) || start < 0) return 'invalid'

    if (endValue === '') {
      end = fileSize - 1
    } else {
      end = Number(endValue)
      if (!Number.isInteger(end) || end < 0) return 'invalid'
    }
  }

  end = Math.min(end, fileSize - 1)

  if (fileSize <= 0 || start >= fileSize || start > end) {
    return 'invalid'
  }

  return { start, end }
}

function createFileBody(filePath: string, range?: { start: number; end: number }) {
  const stream = range
    ? createReadStream(filePath, { start: range.start, end: range.end })
    : createReadStream(filePath)

  return Readable.toWeb(stream) as ReadableStream
}

type RouteContext = { params: Promise<{ path: string[] }> }

async function serveUploadedFile(request: NextRequest, { params }: RouteContext, includeBody: boolean) {
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

    const contentType = getContentType(filePath)
    const baseHeaders = {
      'Accept-Ranges': 'bytes',
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': contentType,
      'Last-Modified': fileStat.mtime.toUTCString(),
    }
    const range = parseRange(request.headers.get('range'), fileStat.size)

    if (range === 'invalid') {
      return new NextResponse(null, {
        status: 416,
        headers: {
          ...baseHeaders,
          'Content-Range': `bytes */${fileStat.size}`,
        },
      })
    }

    if (range) {
      const contentLength = range.end - range.start + 1

      return new NextResponse(includeBody ? createFileBody(filePath, range) : null, {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Length': String(contentLength),
          'Content-Range': `bytes ${range.start}-${range.end}/${fileStat.size}`,
        },
      })
    }

    return new NextResponse(includeBody ? createFileBody(filePath) : null, {
      headers: {
        ...baseHeaders,
        'Content-Length': String(fileStat.size),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 })
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return serveUploadedFile(request, context, true)
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return serveUploadedFile(request, context, false)
}
