/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Section 2 cột — Chuyển đổi số phường (trái) + Niêm yết công khai (phải)
 *                Học từ TTPVHCC Hà Nội: layout "Cải cách HC" + "Văn bản ban hành mới"
 * @lienquan    : src/lib/static-data.ts, data/niem-yet.json
 * @alias       : digital-notices, chuyen-doi-so, niem-yet-home
 */

import Link from 'next/link'
import { getNiemYetData, type NiemYetItem } from '@/lib/static-data'

/* Dữ liệu chuyển đổi số phường — tĩnh, cập nhật qua CMS sau */
const DIGITAL_ITEMS = [
  {
    title: 'Triển khai 100% dịch vụ công trực tuyến toàn trình cấp phường',
    date: '2026-05-01',
    tag: 'Mới',
    href: '/tin-tuc',
  },
  {
    title: 'Ra mắt Chatbot AI hỗ trợ tra cứu thủ tục hành chính 24/7',
    date: '2026-04-15',
    tag: 'AI',
    href: '/tin-tuc',
  },
  {
    title: 'Ứng dụng chữ ký số trong tiếp nhận và trả kết quả hồ sơ',
    date: '2026-03-20',
    tag: '',
    href: '/tin-tuc',
  },
  {
    title: 'Kết nối liên thông dữ liệu dân cư với Cổng DVC Quốc gia',
    date: '2026-03-01',
    tag: '',
    href: '/tin-tuc',
  },
  {
    title: 'Số hóa 100% hồ sơ thủ tục hành chính đang lưu trữ tại phường',
    date: '2026-02-10',
    tag: '',
    href: '/tin-tuc',
  },
]

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM/YYYY
 * @input       : dateStr (string)
 * @output      : string ngày theo định dạng Việt Nam
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * @chucnang    : Cột trái — Chuyển đổi số phường
 * @output      : JSX danh sách tin chuyển đổi số
 */
function DigitalTransformColumn() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      {/* Header — nền đỏ đậm */}
      <div className="bg-primary-dark px-5 py-3.5 flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide">
          Chuyển đổi số
        </h3>
      </div>

      {/* Danh sách */}
      <div className="flex-1 p-4 space-y-0.5">
        {DIGITAL_ITEMS.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="group flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-cream btn-transition"
          >
            {/* Bullet */}
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 btn-transition" />

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary group-hover:text-primary btn-transition line-clamp-2 leading-snug">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-text-muted">{formatDate(item.date)}</span>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-success text-white font-bold uppercase">
                    {item.tag}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/tin-tuc"
          className="text-xs font-semibold text-primary hover:text-primary-dark btn-transition flex items-center gap-1"
        >
          Xem tất cả tin chuyển đổi số
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

/**
 * @chucnang    : Cột phải — Niêm yết công khai (file PDF)
 * @output      : JSX danh sách văn bản niêm yết
 */
function PublicNoticesColumn({ items }: { items: NiemYetItem[] }) {
  /* Lấy tối đa 5 mục mới nhất */
  const latest = items.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      {/* Header — nền xanh đậm */}
      <div className="bg-[#1a3a5c] px-5 py-3.5 flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide">
          Niêm yết công khai
        </h3>
      </div>

      {/* Danh sách file */}
      <div className="flex-1 p-4 space-y-0.5">
        {latest.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            Chưa có văn bản niêm yết
          </p>
        ) : (
          latest.map((item) => (
            <a
              key={item.id}
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-cream btn-transition"
            >
              {/* Icon PDF */}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-danger/10 text-danger shrink-0 mt-0.5 group-hover:bg-danger group-hover:text-white btn-transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-text-primary group-hover:text-primary btn-transition line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted">{formatDate(item.publishedAt)}</span>
                  {item.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cream text-text-secondary font-medium">
                      {item.category}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5 ml-auto">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer link */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/niem-yet"
          className="text-xs font-semibold text-[#1a3a5c] hover:text-primary btn-transition flex items-center gap-1"
        >
          Xem tất cả niêm yết
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export function DigitalAndNotices() {
  const niemYetItems = getNiemYetData()

  return (
    <section className="py-10 md:py-14" id="digital-notices">
      <div className="container-main">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Thông tin công khai
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Chuyển đổi số & Niêm yết
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
        </div>

        {/* 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DigitalTransformColumn />
          <PublicNoticesColumn items={niemYetItems} />
        </div>
      </div>
    </section>
  )
}
