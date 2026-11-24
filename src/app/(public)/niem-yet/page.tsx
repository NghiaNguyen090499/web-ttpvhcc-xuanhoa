/**
 * @nhom        : Pages / Niêm yết
 * @chucnang    : Trang niêm yết — hiển thị danh sách file niêm yết công khai
 *                Dữ liệu đọc từ JSON tĩnh, sau sẽ kết nối CMS
 * @lienquan    : src/lib/static-data.ts, data/niem-yet.json
 * @alias       : niem-yet, public-notices
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getPortalNiemYetData } from '@/lib/portal-db'
import type { NiemYetItem } from '@/lib/static-data'
import { notFound } from 'next/navigation'
import { Pagination, PageRangeInfo } from '@/components/Pagination'
import { paginate, parsePage, type PageSearchParams } from '@/lib/pagination'

export const metadata: Metadata = {
  title: 'Niêm yết',
  description: 'Danh sách văn bản niêm yết công khai tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

export const revalidate = 60

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

export default async function NiemYetPage({ searchParams }: { searchParams: PageSearchParams }) {
  const allItems: NiemYetItem[] = await getPortalNiemYetData()
  const { items, page, totalPages, total, offset, outOfRange } = paginate(allItems, parsePage((await searchParams).page))
  if (outOfRange) notFound()

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
                  <PageRangeInfo offset={offset} count={items.length} total={total} unit="văn bản" />
                </div>
              </div>

              <ol className="overflow-hidden rounded-2xl border border-border bg-white divide-y divide-border">
                {items.map((item, index) => {
                  const attachments = item.attachments?.length ? item.attachments : [{ url: item.fileUrl, name: 'Tài liệu chính', fileType: item.fileType }]
                  return (
                    <li
                      key={item.id}
                      className="group flex gap-4 p-4 sm:p-5 hover:bg-cream/50 btn-transition"
                    >
                      {/* Số thứ tự + icon loại file */}
                      <div className="flex shrink-0 flex-col items-center gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-primary group-hover:bg-primary group-hover:text-white btn-transition">
                          <FileIcon type={item.fileType} />
                        </span>
                        <span className="text-xs font-bold text-text-muted">{String(offset + index + 1).padStart(2, '0')}</span>
                      </div>

                      {/* Thông tin */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold leading-snug text-text-primary group-hover:text-primary btn-transition md:text-lg">
                          <a href={attachments[0]?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.title}
                          </a>
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatDate(item.publishedAt)}
                          </span>
                          {item.category && (
                            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {attachments.map((attachment, attachmentIndex) => (
                            <a
                              key={`${attachment.url}-${attachmentIndex}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white btn-transition"
                            >
                              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              <span className="truncate">{attachment.name || `Tài liệu ${attachmentIndex + 1}`}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <Pagination currentPage={page} totalPages={totalPages} basePath="/niem-yet" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
