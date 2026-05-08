/**
 * @nhom        : API Routes / Auth
 * @chucnang    : POST /api/auth/logout — đăng xuất admin
 * @output      : Redirect về /admin/login
 * @lienquan    : src/lib/auth.ts
 * @alias       : logout-api, dang-xuat
 */

import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export async function POST() {
  await destroySession()
  return NextResponse.json({ success: true, redirect: '/admin/login' })
}
