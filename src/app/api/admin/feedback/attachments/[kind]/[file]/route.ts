/**
 * @nhom        : API Routes / Admin
 * @chucnang    : GET — cán bộ xem/tải tệp đính kèm phản ánh (lưu riêng tư, không công khai)
 * @lienquan    : src/lib/feedback-attachments.ts, src/app/admin/phan-anh/page.tsx
 * @alias       : admin-feedback-attachment
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { readStoredAttachment } from '@/lib/feedback-attachments'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ kind: string; file: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminSession('VIEWER')
  if (auth.response) return auth.response

  const { kind, file } = await params
  const stored = await readStoredAttachment(kind, file)
  if (!stored) {
    return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 })
  }

  const download = request.nextUrl.searchParams.get('download') === '1' || !stored.inline
  const rawName = request.nextUrl.searchParams.get('name')?.slice(0, 120) || file
  const asciiName = rawName.normalize('NFD').replace(/[^\x20-\x7e]/g, '').replace(/["\\]/g, '') || file

  return new NextResponse(new Uint8Array(stored.buffer), {
    headers: {
      'Content-Type': stored.mimeType,
      'Content-Length': String(stored.buffer.length),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(rawName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
