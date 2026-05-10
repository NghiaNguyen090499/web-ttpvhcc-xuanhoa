/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Lịch công tác tuần — bảng lịch làm việc lãnh đạo UBND phường
 *                Hiển thị theo ngày trong tuần, mỗi ngày có danh sách công việc
 * @lienquan    : src/lib/static-data.ts, data/lich-cong-tac.json
 * @alias       : work-schedule, lich-cong-tac, lich-tuan
 */

import Link from 'next/link'
import { getLichCongTac, type LichNgay } from '@/lib/static-data'

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
 * @chucnang    : Kiểm tra ngày có phải hôm nay không
 * @input       : dateStr (string)
 * @output      : boolean
 */
function isToday(dateStr: string): boolean {
  const today = new Date()
  const d = new Date(dateStr)
  return today.toDateString() === d.toDateString()
}

/**
 * @chucnang    : Render 1 ngày trong lịch tuần (widget trang chủ — hiển thị gọn)
 * @input       : lichNgay (LichNgay) — dữ liệu 1 ngày
 * @output      : JSX row
 */
function DayRow({ lichNgay }: { lichNgay: LichNgay }) {
  const today = isToday(lichNgay.ngay)

  return (
    <div className={`px-3 py-2.5 rounded-xl ${today ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-cream'} btn-transition`}>
      {/* Header ngày */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${today ? 'text-primary' : 'text-text-muted'}`}>
          {lichNgay.thu}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${today ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted'}`}>
          {formatShortDate(lichNgay.ngay)}
        </span>
        {today && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success text-white font-bold ml-auto">
            HÔM NAY
          </span>
        )}
      </div>

      {/* Danh sách công việc — hiển thị tối đa 2 mục */}
      <div className="space-y-1">
        {lichNgay.items.slice(0, 2).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {/* Thời gian */}
            <span className="text-[10px] text-text-muted whitespace-nowrap mt-0.5 w-24 shrink-0">
              {item.thoiGian}
            </span>
            {/* Nội dung */}
            <p className="text-[12px] text-text-primary leading-snug line-clamp-1 flex-1">
              {item.noiDung}
            </p>
          </div>
        ))}
        {lichNgay.items.length > 2 && (
          <p className="text-[10px] text-text-muted italic pl-24">
            +{lichNgay.items.length - 2} hoạt động khác
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * @chucnang    : Widget lịch công tác tuần — hiển thị trên trang chủ
 * @output      : JSX section
 */
export function WorkSchedule() {
  const data = getLichCongTac()

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
          <span className="ml-auto text-[10px] text-white/60">
            Tuần {data.metadata.tuanSo}
          </span>
        )}
      </div>

      {/* Danh sách ngày */}
      <div className="flex-1 p-3 space-y-0.5">
        {data.lichTuan.length === 0 ? (
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
