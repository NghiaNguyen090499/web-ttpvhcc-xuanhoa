/**
 * @nhom        : Pages / Tuyên truyền
 * @chucnang    : Trang danh sách tuyên truyền từ CMS — bài viết (mở trang chi tiết) + tài liệu PDF (mở file)
 * @lienquan    : src/lib/portal-db.ts, src/lib/propaganda-media.ts, src/app/admin/tuyen-truyen/page.tsx
 * @alias       : tuyen-truyen, bai-viet-tuyen-truyen, propaganda-articles
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText, Megaphone } from 'lucide-react'
import { getPortalTuyenTruyenData } from '@/lib/portal-db'
import { notFound } from 'next/navigation'
import { Pagination, PageRangeInfo } from '@/components/Pagination'
import { paginate, parsePage, type PageSearchParams } from '@/lib/pagination'
import {
  formatFileSize, formatPropagandaDate, getPropagandaTagStyle, isPropagandaArticle, isPropagandaDocument,
} from '@/lib/propaganda-media'

export const metadata: Metadata = {
  title: 'Tuyên truyền',
  description: 'Bài viết tuyên truyền, phổ biến chính sách và kiến thức hữu ích cho người dân phường Xuân Hòa.',
}

export const revalidate = 60

export default async function PropagandaListPage({ searchParams }: { searchParams: PageSearchParams }) {
  const items = await getPortalTuyenTruyenData()
  const { items: articles, page, totalPages, total, offset, outOfRange } = paginate(
    items.filter((item) => isPropagandaArticle(item) || isPropagandaDocument(item)),
    parsePage((await searchParams).page),
  )
  if (outOfRange) notFound()

  return (
    <>
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Trang chủ
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Tuyên truyền
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Phổ biến chính sách, pháp luật và kiến thức thiết thực về an ninh, sức khỏe, môi trường cho người dân.
          </p>
        </div>
      </section>

      <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-10 md:py-14">
        <div className="container-main">
          {total === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <Megaphone className="h-14 w-14 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-text-primary">Chưa có bài viết tuyên truyền</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                Bài viết sẽ xuất hiện tại đây sau khi cán bộ cập nhật trong hệ thống quản trị.
              </p>
            </div>
          ) : (
            <>
            <div className="mb-5"><PageRangeInfo offset={offset} count={articles.length} total={total} unit="mục" /></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((item) => {
                const style = getPropagandaTagStyle(item.tagColor)
                const isDocument = isPropagandaDocument(item)
                const cardClass = 'group flex flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] btn-transition hover:-translate-y-1 hover:shadow-lg'
                const body = (
                  <>
                    <div className="mb-3 flex items-center gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${style.iconBg}`} aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${style.badge}`}>
                        {item.tag}
                      </span>
                      {isDocument && (
                        <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-700">
                          Tài liệu
                        </span>
                      )}
                    </div>
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-text-primary btn-transition group-hover:text-primary">
                      {item.title}
                    </h2>
                    {item.summary && item.summary !== item.title && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                        {item.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
                      <span className="text-text-muted">{formatPropagandaDate(item.publishedAt)}</span>
                      {isDocument ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          Xem tài liệu{item.fileSize ? ` · ${formatFileSize(item.fileSize)}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-primary btn-transition group-hover:gap-2">
                          Đọc bài viết
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </>
                )
                return isDocument ? (
                  <a key={item.id} href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {body}
                  </a>
                ) : (
                  <Link key={item.id} href={`/tuyen-truyen/${encodeURIComponent(item.id)}`} className={cardClass}>
                    {body}
                  </Link>
                )
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/tuyen-truyen" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
