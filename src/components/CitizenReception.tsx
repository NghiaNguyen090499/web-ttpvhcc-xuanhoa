/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Lịch tiếp công dân — hiển thị lịch tiếp dân định kỳ tháng hiện tại
 *                Theo Luật Tiếp công dân 2013 + Luật Thực hiện dân chủ cơ sở 2022
 * @lienquan    : src/lib/static-data.ts, data/lich-tiep-dan.json
 * @alias       : citizen-reception, lich-tiep-dan, tiep-cong-dan
 */

import Link from 'next/link'
import { getLichTiepDan, type LichTiepDanEntry } from '@/lib/static-data'

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM
 * @input       : dateStr (string)
 * @output      : string
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/**
 * @chucnang    : Lấy tên thứ từ ngày
 * @input       : dateStr (string)
 * @output      : string
 */
function getDayName(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return days[d.getDay()]
}

/**
 * @chucnang    : Kiểm tra ngày đã qua hay chưa
 * @input       : dateStr (string)
 * @output      : boolean
 */
function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

/**
 * @chucnang    : Kiểm tra ngày có phải hôm nay
 * @input       : dateStr (string)
 * @output      : boolean
 */
function isToday(dateStr: string): boolean {
  return new Date().toDateString() === new Date(dateStr).toDateString()
}

/**
 * @chucnang    : Render 1 buổi tiếp dân trong danh sách
 * @input       : entry (LichTiepDanEntry) — dữ liệu 1 buổi
 * @output      : JSX card
 */
function ReceptionEntry({ entry }: { entry: LichTiepDanEntry }) {
  const past = isPast(entry.ngay)
  const today = isToday(entry.ngay)

  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-xl btn-transition ${
      today ? 'bg-primary/5 ring-1 ring-primary/20' : past ? 'opacity-50' : 'hover:bg-cream'
    }`}>
      {/* Badge ngày */}
      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
        today ? 'bg-primary text-white' : past ? 'bg-gray-100 text-text-muted' : 'bg-cream text-primary'
      }`}>
        <span className="text-sm font-bold leading-none">{formatDate(entry.ngay).split('/')[0]}</span>
        <span className="text-[9px] uppercase">Th{formatDate(entry.ngay).split('/')[1]}</span>
      </div>

      {/* Nội dung */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-text-primary truncate">
            {getDayName(entry.ngay)} — {entry.buoi}
          </p>
          {today && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success text-white font-bold shrink-0">
              HÔM NAY
            </span>
          )}
          {past && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 text-text-muted font-medium shrink-0">
              Đã qua
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
          {entry.nguoiTiep}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">
          {entry.thoiGian}
        </p>
      </div>
    </div>
  )
}

/**
 * @chucnang    : Widget lịch tiếp công dân — hiển thị trên trang chủ
 * @output      : JSX component
 */
export function CitizenReception() {
  const data = getLichTiepDan()

  /* Lấy tối đa 4 buổi gần nhất (ưu tiên buổi sắp tới) */
  const sorted = [...data.lichThang].sort(
    (a, b) => new Date(a.ngay).getTime() - new Date(b.ngay).getTime()
  )
  const display = sorted.slice(0, 4)

  /* Tên tháng */
  const monthName = data.metadata.thang > 0
    ? `Tháng ${data.metadata.thang}/${data.metadata.nam}`
    : ''

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#1a5c3a] px-5 py-3.5 flex items-center gap-2">
        {/* Icon người + lịch */}
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide">
          Lịch tiếp công dân
        </h3>
        {monthName && (
          <span className="ml-auto text-[10px] text-white/60">
            {monthName}
          </span>
        )}
      </div>

      {/* Danh sách buổi tiếp dân */}
      <div className="flex-1 p-3 space-y-0.5">
        {display.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            Chưa có lịch tiếp công dân
          </p>
        ) : (
          display.map((entry, i) => (
            <ReceptionEntry key={`${entry.ngay}-${i}`} entry={entry} />
          ))
        )}
      </div>

      {/* Quy định ngắn gọn */}
      {data.quyDinh.dinhKy && (
        <div className="px-4 py-2 bg-cream/50 border-t border-border">
          <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">
            <strong className="text-text-secondary">Quy định:</strong> {data.quyDinh.dinhKy}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/lich-tiep-dan"
          className="text-xs font-semibold text-[#1a5c3a] hover:text-primary btn-transition flex items-center gap-1"
        >
          Xem toàn bộ lịch tiếp dân
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
