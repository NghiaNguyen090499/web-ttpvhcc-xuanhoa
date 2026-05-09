/**
 * @nhom        : Pages / Niêm yết
 * @chucnang    : Trang niêm yết — hiển thị danh sách file niêm yết công khai
 *                Dữ liệu đọc từ JSON tĩnh, sau sẽ kết nối CMS
 * @lienquan    : src/lib/static-data.ts, data/niem-yet.json
 * @alias       : niem-yet, public-notices
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getNiemYetData, type NiemYetItem } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Niêm yết',
  description: 'Danh sách văn bản niêm yết công khai tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

/**
 * @chucnang    : Icon theo loại file (pdf, image, doc)
 * @input       : fileType (string)
 * @output      : JSX SVG icon
 */
function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }
  if (type === 'image') {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM/YYYY
 * @input       : dateStr (string)
 * @output      : string
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function NiemYetPage() {
  const items: NiemYetItem[] = getNiemYetData()

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Niêm yết</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Niêm yết công khai
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Danh sách văn bản, tài liệu niêm yết công khai tại TTPVHCC Phường Xuân Hòa.
          </p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          {items.length === 0 ? (
            /* Trạng thái rỗng — chưa có file niêm yết */
            <div className="text-center py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream mx-auto mb-6">
                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Chưa có niêm yết</h2>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                Hiện chưa có văn bản niêm yết công khai. Các file niêm yết sẽ được cập nhật thường xuyên qua hệ thống quản trị.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark btn-transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Về trang chủ
              </Link>
            </div>
          ) : (
            /* Danh sách file niêm yết */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide">
                    Danh sách niêm yết
                  </h2>
                  <p className="text-sm text-text-muted">{items.length} văn bản</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg btn-transition"
                  >
                    {/* Icon loại file */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-primary group-hover:bg-primary group-hover:text-white btn-transition">
                      <FileIcon type={item.fileType} />
                    </div>
                    {/* Thông tin */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary btn-transition line-clamp-2">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-cream rounded-full text-text-secondary font-medium">
                          {item.category}
                        </span>
                      )}
                      {item.description && (
                        <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-text-muted">{formatDate(item.publishedAt)}</span>
                        <span className="text-[10px] font-semibold text-primary uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Tải xuống
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
