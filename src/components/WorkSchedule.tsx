/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Lịch công tác tuần — bảng lịch làm việc lãnh đạo UBND phường
 *                Hiển thị theo ngày trong tuần, mỗi ngày có danh sách công việc
 * @lienquan    : src/lib/portal-db.ts, data/lich-cong-tac.json fallback
 * @alias       : work-schedule, lich-cong-tac, lich-tuan
 */

import Link from 'next/link'
import { getPortalLichCongTac } from '@/lib/portal-db'
import type { LichNgay, LichTrucEntry } from '@/lib/static-data'

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM
 * @input       : dateStr (string)
 * @output      : string ngày ngắn
 */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/**
 * @chucnang    : Render 1 ngày trong lịch tuần (widget trang chủ — hiển thị gọn)
 * @input       : lichNgay (LichNgay) — dữ liệu 1 ngày
 * @output      : JSX row
 */
function DayRow({ lichNgay }: { lichNgay: LichNgay }) {
  return (
    <div className="rounded-xl px-3 py-2.5 btn-transition hover:bg-cream">
      {/* Header ngày */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-bold uppercase tracking-wide text-text-muted">
          {lichNgay.thu}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-text-muted">
          {formatShortDate(lichNgay.ngay)}
        </span>
      </div>

      {/* Danh sách công việc — hiển thị tối đa 2 mục */}
      <div className="space-y-1">
        {lichNgay.items.slice(0, 2).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {/* Thời gian */}
            <span className="text-sm text-text-muted whitespace-nowrap mt-0.5 w-24 shrink-0">
              {item.thoiGian}
            </span>
            {/* Nội dung */}
            <p className="text-sm text-text-primary leading-snug line-clamp-1 flex-1">
              {item.noiDung}
            </p>
          </div>
        ))}
        {lichNgay.items.length > 2 && (
          <p className="text-sm text-text-muted italic pl-24">
            +{lichNgay.items.length - 2} hoạt động khác
          </p>
        )}
      </div>
    </div>
  )
}

function DutyRow({ item }: { item: LichTrucEntry }) {
  return (
    <div className="rounded-xl px-3 py-2.5 btn-transition hover:bg-cream">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold uppercase tracking-wide text-text-muted">
          {item.thu}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-text-muted">
          {formatShortDate(item.ngay)}
        </span>
      </div>
      <div className="mt-1.5 flex items-start gap-2">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-text-primary">
            {item.lanhDaoTruc || 'Không có lịch trực'}
          </p>
          {item.chucVu && (
            <p className="line-clamp-1 text-sm text-text-muted">{item.chucVu}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * @chucnang    : Widget lịch công tác tuần — hiển thị trên trang chủ
 * @output      : JSX section
 */
export async function WorkSchedule() {
  const data = await getPortalLichCongTac()
  const dutySchedule = data.lichTruc || []

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-primary-dark px-5 py-3.5 flex items-center gap-2">
        {/* Icon lịch */}
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide">
          Lịch công tác tuần
        </h3>
        {data.metadata.tuanSo > 0 && (
          <span className="ml-auto text-sm text-white/60">
            Tuần {data.metadata.tuanSo}
          </span>
        )}
      </div>

      {/* Danh sách ngày */}
      <div className="flex-1 p-3 space-y-0.5">
        {dutySchedule.length > 0 ? (
          dutySchedule.slice(0, 6).map((item) => (
            <DutyRow key={item.ngay} item={item} />
          ))
        ) : data.lichTuan.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            Chưa có lịch công tác
          </p>
        ) : (
          data.lichTuan.slice(0, 5).map((ngay) => (
            <DayRow key={ngay.ngay} lichNgay={ngay} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/lich-cong-tac"
          className="text-xs font-semibold text-primary hover:text-primary-dark btn-transition flex items-center gap-1"
        >
          Xem chi tiết lịch tuần
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
