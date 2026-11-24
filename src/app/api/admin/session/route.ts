/**
 * @nhom        : API Routes / Auth
 * @chucnang    : GET /api/admin/session — kiểm tra phiên còn hiệu lực; proxy gia hạn khi người dùng còn thao tác
 * @output      : { ok: true } hoặc 401
 * @lienquan    : src/proxy.ts, src/components/admin/AdminShell.tsx
 * @alias       : session-keepalive
 */

import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdminSession('VIEWER')
  if (auth.response) return auth.response
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
