/**
 * @nhom        : Pages / Tin tức chi tiết
 * @chucnang    : Trang chi tiết bài viết tin tức — gallery ảnh, bài liên quan
 * @lienquan    : src/lib/portal-db.ts, data/news.json fallback
 * @alias       : news-detail, tin-tuc-slug
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPortalArticleComments, getPortalNewsBySlug, getPortalNewsData } from '@/lib/portal-db'
import { normalizeArticleHtml } from '@/lib/html'
import NewsDetailGallery from './NewsDetailGallery'
import ArticleComments from './ArticleComments'
import { ArticleImageViewerProvider, ZoomableArticleHtml, ZoomableCover } from './ArticleImageViewer'

export const revalidate = 60

/**
 * @chucnang    : Tạo metadata SEO cho trang chi tiết tin tức
 * @input       : params chứa slug
 * @output      : Metadata object
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const news = await getPortalNewsBySlug(slug)
  if (!news) return { title: 'Không tìm thấy bài viết' }
  return {
    title: news.title,
    description: news.excerpt,
  }
}

/**
 * @chucnang    : Generate static params cho tất cả bài viết
 * @output      : Array<{ slug: string }>
 */
export async function generateStaticParams() {
  const news = await getPortalNewsData()
  return news.map((n) => ({ slug: n.slug }))
}

/**
 * @chucnang    : Format ngày từ ISO sang dạng hiển thị
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

// Bảng màu tag
const TAG_COLORS: Record<string, string> = {
  'Hành chính': 'bg-blue-100 text-blue-700',
  'Đoàn thanh niên': 'bg-green-100 text-green-700',
  'Thiện nguyện': 'bg-pink-100 text-pink-700',
  'Giáo dục': 'bg-purple-100 text-purple-700',
  'Văn hóa': 'bg-amber-100 text-amber-700',
  'Thi đua': 'bg-orange-100 text-orange-700',
  'An ninh': 'bg-red-100 text-red-700',
  'Đối ngoại': 'bg-cyan-100 text-cyan-700',
  'Quy hoạch': 'bg-teal-100 text-teal-700',
  'Y tế': 'bg-emerald-100 text-emerald-700',
  'Công đoàn': 'bg-indigo-100 text-indigo-700',
  'An sinh': 'bg-sky-100 text-sky-700',
  'Lao động': 'bg-orange-100 text-orange-700',
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const news = await getPortalNewsBySlug(slug)

  if (!news) notFound()

  // Lấy bài liên quan (cùng tag, loại trừ bài hiện tại)
  const allNews = await getPortalNewsData()
  const related = allNews
    .filter((n) => n.id !== news.id && n.tag === news.tag)
    .slice(0, 3)

  // Nếu không đủ bài cùng tag, bổ sung bài khác
  const relatedFinal = related.length >= 3
    ? related
    : [
        ...related,
        ...allNews
          .filter((n) => n.id !== news.id && !related.find((r) => r.id === n.id))
          .slice(0, 3 - related.length),
      ]

  // Tập hợp tất cả ảnh (ảnh chính + gallery)
  const allImages = news.images && news.images.length > 0
    ? news.images
    : [news.image]

  const articleHtml = normalizeArticleHtml(news.content)
  const commentsEnabled = news.commentsEnabled !== false
  const initialComments = commentsEnabled ? await getPortalArticleComments(news.id) : []

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-10 text-white md:py-14">
        <div className="container-main max-w-3xl">
          <nav className="flex items-center gap-2 text-xs text-white/60 flex-wrap">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/tin-tuc" className="hover:text-white/90 btn-transition">Tin tức</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90 line-clamp-1">{news.title}</span>
          </nav>
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide md:text-3xl leading-tight">
            {news.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TAG_COLORS[news.tag] || 'bg-white/20 text-white'}`}>
              {news.tag}
            </span>
            <span className="text-xs text-white/70">{formatDate(news.date)}</span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs text-white/70">Nguồn: {news.source || 'Facebook Phường Xuân Hòa'}</span>
            {allImages.length > 1 && (
              <>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs text-white/70">📷 {allImages.length} ảnh</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-10 md:py-14">
        <div className="container-main max-w-3xl">
          <ArticleImageViewerProvider>
          <article className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Ảnh chính — hiển thị đủ ảnh, kể cả poster dọc; bấm để phóng to */}
            <ZoomableCover src={news.image} images={allImages} title={news.title} />

            <div className="p-6 md:p-8">
              {/* Gallery ảnh phụ — client component có lightbox */}
              {allImages.length > 1 && (
                <NewsDetailGallery images={allImages} title={news.title} />
              )}

              {/* Tóm tắt */}
              <div className="bg-cream rounded-xl p-4 mb-6 border-l-4 border-primary">
                <p className="text-sm text-text-secondary italic leading-relaxed">{news.excerpt}</p>
              </div>

              {/* Nội dung chính */}
              <ZoomableArticleHtml className="prose-article" html={articleHtml} />

              {/* Chia sẻ + nguồn */}
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
                <a href="https://www.facebook.com/phuongxuanhoatphochiminh"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary font-medium hover:underline btn-transition">
                  📱 Xem trên Facebook
                </a>
                <Link href="/tin-tuc" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-primary btn-transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </article>
          </ArticleImageViewerProvider>

          <ArticleComments
            articleId={news.id}
            commentsEnabled={commentsEnabled}
            initialComments={initialComments}
          />

          {/* Bài viết liên quan */}
          {relatedFinal.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-text-primary mb-4">
                Bài viết liên quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedFinal.map((item) => (
                  <Link key={item.id} href={`/tin-tuc/${item.slug}`}
                    className="block rounded-2xl border border-border bg-white overflow-hidden hover:-translate-y-0.5 hover:shadow-lg btn-transition">
                    <div className="relative w-full bg-surface" style={{ aspectRatio: '16/10' }}>
                      <Image src={item.image} alt={item.title} fill className="object-contain" sizes="33vw" />
                    </div>
                    <div className="p-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[item.tag] || 'bg-primary/10 text-primary'}`}>
                        {item.tag}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold text-text-primary line-clamp-2 leading-snug">{item.title}</h3>
                      <p className="mt-1 text-sm text-text-muted">{formatDate(item.date)}</p>
                    </div>
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
