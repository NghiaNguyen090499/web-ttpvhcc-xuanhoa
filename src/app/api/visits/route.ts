/**
 * @nhom        : API Routes / Public
 * @chucnang    : Bộ đếm lượt truy cập — GET đọc tổng, POST ghi nhận 1 lượt mỗi lần tải trang
 * @output      : { total: number }
 * @lienquan    : src/lib/queries.ts, src/components/VisitCounter.tsx
 * @alias       : visits-api, luot-truy-cap
 *
 * Tổng hiển thị = VISIT_COUNTER_BASE (mặc định 30000) + số lượt đếm thực trong DB.
 * Mỗi lần tải/chuyển trang đếm 1 lượt; bot/crawler bị bỏ qua.
 * Không lưu IP hay bất kỳ dữ liệu cá nhân nào.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSiteCounter, incrementSiteCounter } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COUNTER_KEY = 'site_visits'
const BOT_UA = /bot|crawl|spider|slurp|preview|monitor|curl|wget|python|headless|lighthouse/i

function getBase() {
  const base = Number.parseInt(process.env.VISIT_COUNTER_BASE || '', 10)
  return Number.isFinite(base) && base >= 0 ? base : 30000
}

function respond(counted: number) {
  return NextResponse.json(
    { total: getBase() + counted },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

async function readCount() {
  try {
    return await getSiteCounter(COUNTER_KEY)
  } catch {
    return 0
  }
}

export async function GET() {
  return respond(await readCount())
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  if (!userAgent || BOT_UA.test(userAgent)) {
    return respond(await readCount())
  }

  let counted: number
  try {
    counted = await incrementSiteCounter(COUNTER_KEY)
  } catch (err) {
    console.warn('[Visits] Không ghi được lượt truy cập:', err)
    return respond(0)
  }

  return respond(counted)
}
