/**
 * @nhom        : Pages / Tuyên truyền
 * @chucnang    : Trang chi tiết bài viết tuyên truyền
 * @lienquan    : src/app/(public)/tuyen-truyen/page.tsx, src/lib/portal-db.ts, src/lib/html.ts
 * @alias       : tuyen-truyen-chi-tiet, propaganda-article-detail
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getPortalTuyenTruyenData } from '@/lib/portal-db'
import { normalizeArticleHtml } from '@/lib/html'
import { formatPropagandaDate, getPropagandaTagStyle, isPropagandaArticle } from '@/lib/propaganda-media'

export const revalidate = 60

async function getArticles() {
  const items = await getPortalTuyenTruyenData()
  return items.filter(isPropagandaArticle)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const article = (await getArticles()).find((item) => item.id === id)
  if (!article) return { title: 'Không tìm thấy bài viết' }
  return { title: article.title, description: article.summary }
}

export default async function PropagandaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const articles = await getArticles()
  const article = articles.find((item) => item.id === id)

  if (!article) notFound()

  const style = getPropagandaTagStyle(article.tagColor)
  const articleHtml = normalizeArticleHtml(article.content)
  const related = articles.filter((item) => item.id !== article.id).slice(0, 3)

  return (
    <>
      <section className="hero-gradient px-4 py-10 text-white md:py-14">
        <div className="container-main max-w-3xl">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="btn-transition hover:text-white/90">Trang chủ</Link>
            <span aria-hidden="true">›</span>
            <Link href="/tuyen-truyen" className="btn-transition hover:text-white/90">Tuyên truyền</Link>
            <span aria-hidden="true">›</span>
            <span className="line-clamp-1 text-white/90">{article.title}</span>
          </nav>
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase leading-tight tracking-wide md:text-3xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
              {article.tag}
            </span>
            {article.publishedAt && (
              <span className="text-xs text-white/70">{formatPropagandaDate(article.publishedAt)}</span>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main max-w-3xl">
          <article className="rounded-2xl border border-border bg-white p-6 md:p-8">
            {article.summary && (
              <div className="mb-6 rounded-xl border-l-4 border-primary bg-cream p-4">
                <p className="text-sm italic leading-relaxed text-text-secondary">{article.summary}</p>
              </div>
            )}

            <div className="prose-article" dangerouslySetInnerHTML={{ __html: articleHtml }} />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <span className="text-sm text-text-muted">UBND Phường Xuân Hòa</span>
              <Link href="/tuyen-truyen" className="inline-flex items-center gap-2 text-sm text-text-muted btn-transition hover:text-primary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Tất cả bài tuyên truyền
              </Link>
            </div>
          </article>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-heading text-lg font-bold uppercase text-text-primary">Bài viết khác</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/tuyen-truyen/${encodeURIComponent(item.id)}`}
                    className="group flex flex-col rounded-xl border border-border bg-white p-4 btn-transition hover:shadow-md"
                  >
                    <span className="text-xl" aria-hidden="true">{item.icon}</span>
                    <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-text-primary group-hover:text-primary">
                      {item.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-primary">
                      Đọc tiếp <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
