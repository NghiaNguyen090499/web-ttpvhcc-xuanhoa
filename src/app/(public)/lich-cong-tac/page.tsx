/**
 * @nhom        : Pages / Lịch công tác
 * @chucnang    : Trang đầy đủ lịch công tác tuần — bảng chi tiết theo ngày
 * @lienquan    : src/lib/static-data.ts, data/lich-cong-tac.json
 * @alias       : lich-cong-tac-page, work-schedule-page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getLichCongTac } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Lịch công tác tuần',
  description: 'Lịch công tác tuần của lãnh đạo UBND Phường Xuân Hòa — thời gian, nội dung, chủ trì, địa điểm.',
}

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM/YYYY
 * @input       : dateStr (string)
 * @output      : string
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * @chucnang    : Kiểm tra ngày có phải hôm nay
 * @input       : dateStr (string)
 * @output      : boolean
 */
function isToday(dateStr: string): boolean {
  return new Date().toDateString() === new Date(dateStr).toDateString()
}

export default function LichCongTacPage() {
  const data = getLichCongTac()

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Lịch công tác</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Lịch công tác tuần
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Lịch làm việc của lãnh đạo UBND Phường Xuân Hòa — cập nhật hàng tuần.
          </p>
          {data.metadata.tuanSo > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                Tuần {data.metadata.tuanSo}: {new Date(data.metadata.tuanTu).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} — {new Date(data.metadata.tuanDen).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Nội dung lịch */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Thông tin cập nhật */}
          <div className="flex items-center gap-2 mb-6 text-xs text-text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cập nhật: {formatDate(data.metadata.capNhat)} · {data.metadata.nguoiDuyet}
          </div>

          {/* Bảng lịch chi tiết */}
          <div className="space-y-4">
            {data.lichTuan.map((ngay) => {
              const today = isToday(ngay.ngay)
              return (
                <div
                  key={ngay.ngay}
                  className={`bg-white rounded-2xl border overflow-hidden ${
                    today ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                  }`}
                >
                  {/* Header ngày */}
                  <div className={`px-5 py-3 flex items-center gap-3 ${
                    today ? 'bg-primary text-white' : 'bg-cream'
                  }`}>
                    <h3 className={`text-sm font-bold font-heading uppercase tracking-wide ${
                      today ? 'text-white' : 'text-text-primary'
                    }`}>
                      {ngay.thu}
                    </h3>
                    <span className={`text-xs font-medium ${
                      today ? 'text-white/80' : 'text-text-muted'
                    }`}>
                      {formatDate(ngay.ngay)}
                    </span>
                    {today && (
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                        HÔM NAY
                      </span>
                    )}
                  </div>

                  {/* Chi tiết công việc */}
                  <div className="divide-y divide-border/50">
                    {ngay.items.map((item, i) => (
                      <div key={i} className="px-5 py-4 flex flex-col md:flex-row md:items-start gap-3">
                        {/* Thời gian */}
                        <div className="flex items-center gap-2 md:w-36 shrink-0">
                          <svg className="w-4 h-4 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-primary">
                            {item.thoiGian}
                          </span>
                        </div>

                        {/* Nội dung */}
                        <div className="flex-1">
                          <p className="text-sm text-text-primary leading-relaxed">
                            {item.noiDung}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {/* Chủ trì */}
                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {item.chuTri}
                            </span>
                            {/* Địa điểm */}
                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {item.diaDiem}
                            </span>
                            {/* Ghi chú */}
                            {item.ghiChu && (
                              <span className="text-xs text-amber-600 italic">
                                📌 {item.ghiChu}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ghi chú */}
          <div className="mt-8 p-5 bg-cream/50 rounded-2xl border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-2">📋 Ghi chú</h3>
            <ul className="space-y-1 text-xs text-text-secondary">
              <li>• Lịch có thể thay đổi do yêu cầu công tác đột xuất.</li>
              <li>• Cán bộ, công chức được mời họp chuẩn bị đầy đủ tài liệu theo yêu cầu.</li>
              <li>• Liên hệ Văn phòng UBND Phường để biết thêm chi tiết.</li>
            </ul>
          </div>

          {/* Quay lại */}
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline btn-transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
