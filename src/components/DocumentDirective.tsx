/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Văn bản chỉ đạo điều hành — danh sách văn bản ban hành gần đây
 *                Theo NĐ 42/2022/NĐ-CP về cung cấp thông tin trên môi trường mạng
 * @lienquan    : src/lib/static-data.ts, data/van-ban.json
 * @alias       : document-directive, van-ban-chi-dao, chi-dao-dieu-hanh
 */

import Link from 'next/link'
import { getVanBanData, type VanBanItem } from '@/lib/static-data'

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM/YYYY
 * @input       : dateStr (string)
 * @output      : string
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * @chucnang    : Lấy màu theo loại văn bản
 * @input       : loai (string)
 * @output      : object { bg, text }
 */
function getTypeColor(loai: string): { bg: string; text: string } {
  switch (loai) {
    case 'Quyết định': return { bg: 'bg-red-50', text: 'text-red-700' }
    case 'Kế hoạch': return { bg: 'bg-blue-50', text: 'text-blue-700' }
    case 'Thông báo': return { bg: 'bg-amber-50', text: 'text-amber-700' }
    case 'Công văn': return { bg: 'bg-emerald-50', text: 'text-emerald-700' }
    default: return { bg: 'bg-gray-50', text: 'text-gray-700' }
  }
}

/**
 * @chucnang    : Render 1 văn bản trong danh sách widget
 * @input       : item (VanBanItem)
 * @output      : JSX row
 */
function DocumentRow({ item }: { item: VanBanItem }) {
  const typeColor = getTypeColor(item.loai)

  return (
    <a
      href={item.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-cream btn-transition"
    >
      {/* Icon file */}
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/8 text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white btn-transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </span>

      {/* Nội dung */}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-text-primary group-hover:text-primary btn-transition line-clamp-2 leading-snug">
          {item.trichYeu}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Số ký hiệu */}
          <span className="text-[10px] font-semibold text-primary">
            {item.soKyHieu}
          </span>
          {/* Loại văn bản */}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeColor.bg} ${typeColor.text}`}>
            {item.loai}
          </span>
          {/* Ngày */}
          <span className="text-[10px] text-text-muted">
            {formatDate(item.ngayBanHanh)}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <svg className="w-3.5 h-3.5 text-text-muted/30 ml-auto shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 btn-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

/**
 * @chucnang    : Section văn bản chỉ đạo điều hành — hiển thị trên trang chủ
 * @output      : JSX section
 */
export function DocumentDirective() {
  const vanBanList = getVanBanData()

  /* Sắp xếp theo ngày mới nhất, lấy 5 văn bản đầu */
  const latest = [...vanBanList]
    .sort((a, b) => new Date(b.ngayBanHanh).getTime() - new Date(a.ngayBanHanh).getTime())
    .slice(0, 5)

  /* Đếm theo loại */
  const countByType = vanBanList.reduce((acc, vb) => {
    acc[vb.loai] = (acc[vb.loai] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <section className="py-10 md:py-14 bg-cream/30" id="van-ban-chi-dao">
      <div className="container-main">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Chỉ đạo — Điều hành
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Văn bản chỉ đạo điều hành
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
          <p className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
            Các quyết định, kế hoạch, thông báo, công văn do UBND Phường Xuân Hòa ban hành
          </p>
        </div>

        {/* Thống kê nhanh theo loại */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {Object.entries(countByType).map(([loai, count]) => {
            const color = getTypeColor(loai)
            return (
              <span key={loai} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${color.bg} ${color.text}`}>
                {loai}
                <span className="font-bold">{count}</span>
              </span>
            )
          })}
        </div>

        {/* Danh sách văn bản */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-3xl mx-auto">
          <div className="divide-y divide-border/50">
            {latest.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                Chưa có văn bản chỉ đạo
              </p>
            ) : (
              latest.map((item) => (
                <DocumentRow key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              Tổng: {vanBanList.length} văn bản
            </span>
            <Link
              href="/van-ban"
              className="text-xs font-semibold text-primary hover:text-primary-dark btn-transition flex items-center gap-1"
            >
              Xem tất cả văn bản
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
