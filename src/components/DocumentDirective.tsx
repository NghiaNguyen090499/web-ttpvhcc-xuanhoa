/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Văn bản chỉ đạo điều hành — card sidebar danh sách văn bản ban hành gần đây
 *                Theo NĐ 42/2022/NĐ-CP về cung cấp thông tin trên môi trường mạng
 * @lienquan    : src/lib/static-data.ts, data/van-ban.json
 * @alias       : document-directive, van-ban-chi-dao, chi-dao-dieu-hanh
 */

import Link from 'next/link'
import { getPortalVanBanData } from '@/lib/portal-db'
import { getVerticalMarqueeDuration } from '@/lib/marquee'
import type { VanBanItem } from '@/lib/static-data'

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
 * @chucnang    : Render 1 văn bản trong danh sách widget
 * @input       : item (VanBanItem)
 * @output      : JSX row
 */
function DocumentRow({ item }: { item: VanBanItem }) {
  return (
    <a
      href={item.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 border-b border-border py-4 transition hover:bg-primary-50"
    >
      {/* Icon file */}
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-warning">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </span>

      {/* Nội dung */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary group-hover:text-primary">
          {item.trichYeu}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          <span>
            {formatDate(item.ngayBanHanh)}
          </span>
          <span>•</span>
          <span className="line-clamp-1">
            Văn bản điều hành
          </span>
          <span className="ml-auto font-bold text-primary">PDF</span>
        </div>
      </div>
    </a>
  )
}

/**
 * @chucnang    : Card văn bản chỉ đạo điều hành — hiển thị ở sidebar trang chủ
 * @output      : JSX section
 */
export async function DocumentDirective() {
  const vanBanList = await getPortalVanBanData()

  /* Sắp xếp theo ngày mới nhất và nhân đôi danh sách để tạo hiệu ứng cuộn liên tục */
  const latest = [...vanBanList]
    .sort((a, b) => new Date(b.ngayBanHanh).getTime() - new Date(a.ngayBanHanh).getTime())
  const scrollItems = [...latest, ...latest]

  return (
    <div id="van-ban-chi-dao" className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#123f68] px-5 py-4 text-white">
        <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="font-heading text-base font-bold uppercase tracking-wide">
          Văn bản chỉ đạo điều hành
        </h3>
      </div>

      {/* Danh sách văn bản cuộn lên */}
      {latest.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          Chưa có văn bản chỉ đạo
        </p>
      ) : (
        <div className="directive-marquee directive-scroll-mask h-[320px] overflow-hidden px-4">
          <div
            className="animate-directive-scroll"
            style={{ animationDuration: getVerticalMarqueeDuration(latest.length) }}
          >
            {scrollItems.map((item, index) => (
              <DocumentRow key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/van-ban"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark btn-transition"
        >
          Xem tất cả văn bản
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="ml-auto font-medium text-text-muted">({vanBanList.length})</span>
        </Link>
      </div>
    </div>
  )
}
