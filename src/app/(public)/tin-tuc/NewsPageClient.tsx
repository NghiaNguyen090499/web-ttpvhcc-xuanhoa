/**
 * @nhom        : Pages / Tin tức (Client)
 * @chucnang    : Client component trang tin tức — tabs lọc, tìm kiếm, sidebar
 *                Layout 2 cột: Featured + Sidebar (trên) → Grid cards (dưới)
 * @lienquan    : src/components/NewsTabs.tsx, src/app/(public)/tin-tuc/page.tsx
 * @alias       : news-page-client, tin-tuc-client
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NewsTabs, { TAG_COLORS, NewsSearch } from '@/components/NewsTabs'

/** Kiểu dữ liệu tin tức */
interface NewsItem {
  id: string
  title: string
  slug: string
  date: string
  tag: string
  image: string
  images?: string[]
  excerpt: string
  content: string
  source: string
}

interface NewsPageClientProps {
  news: NewsItem[]
}

/**
 * @chucnang    : Format ngày từ ISO sang dạng DD/MM/YYYY
 * @input       : dateStr (string) — ngày dạng YYYY-MM-DD
 * @output      : string — ngày dạng DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * @chucnang    : Tính thời gian tương đối
 * @input       : dateStr (string)
 * @output      : string
 */
function timeAgo(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return `${Math.floor(diffDays / 30)} tháng trước`
}

const ITEMS_PER_PAGE = 9 // Số bài trong grid mỗi trang

export default function NewsPageClient({ news }: NewsPageClientProps) {
  // State tìm kiếm + phân trang
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Lọc theo search query
  const searchFilteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news
    const q = searchQuery.toLowerCase().trim()
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
    )
  }, [news, searchQuery])

  return (
    <>
      {/* Hero breadcrumb */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">Tin tức</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Tin tức — Thông báo
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Cập nhật thông tin mới nhất từ Phường Xuân Hòa — {news.length} bài viết
          </p>
        </div>
      </section>

      {/* Nội dung chính */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Thanh tìm kiếm */}
          <div className="mb-6 max-w-md">
            <NewsSearch onSearch={setSearchQuery} />
          </div>

          {/* Tabs + Nội dung */}
          <NewsTabs allNews={searchFilteredNews}>
            {(filteredNews, activeTag) => (
              <>
                {/* Không có kết quả */}
                {filteredNews.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm text-text-muted">
                      Không tìm thấy tin tức
                      {activeTag !== 'Tất cả' && ` trong mục "${activeTag}"`}
                      {searchQuery && ` với từ khóa "${searchQuery}"`}
                    </p>
                  </div>
                )}

                {/* Có kết quả */}
                {filteredNews.length > 0 && (
                  <>
                    {/* Layout 2 cột: Featured + Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                      {/* Tin nổi bật — 2/3 */}
                      <div className="lg:col-span-2">
                        <Link
                          href={`/tin-tuc/${filteredNews[0].slug}`}
                          className="group block rounded-2xl border border-border bg-white overflow-hidden hover:shadow-xl btn-transition"
                        >
                          <div className="md:flex h-full">
                            {/* Ảnh */}
                            <div className="md:w-1/2 relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                              <Image
                                src={filteredNews[0].image}
                                alt={filteredNews[0].title}
                                fill
                                className="object-cover object-top group-hover:scale-105 btn-transition"
                                sizes="(max-width: 768px) 100vw, 40vw"
                              />
                            </div>

                            {/* Nội dung */}
                            <div className="p-6 md:w-1/2 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${TAG_COLORS[filteredNews[0].tag] || 'bg-primary/10 text-primary'}`}>
                                  {filteredNews[0].tag}
                                </span>
                                <span className="text-[10px] text-text-muted">{timeAgo(filteredNews[0].date)}</span>
                              </div>
                              <h2 className="text-lg font-bold text-text-primary leading-snug mb-2 group-hover:text-primary btn-transition">
                                {filteredNews[0].title}
                              </h2>
                              <p className="text-sm text-text-secondary line-clamp-3">{filteredNews[0].excerpt}</p>
                              <div className="flex items-center gap-3 mt-4">
                                <span className="text-[10px] text-text-muted">{formatDate(filteredNews[0].date)}</span>
                                <span className="text-xs text-primary font-medium group-hover:underline">Đọc tiếp →</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Sidebar — 1/3 */}
                      <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-white overflow-hidden h-full flex flex-col">
                          {/* Header */}
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-cream/50">
                            <div className="w-1 h-5 bg-primary rounded-full" />
                            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                              {activeTag === 'Tất cả' ? 'Tin mới nhất' : `Tin ${activeTag}`}
                            </h4>
                          </div>

                          {/* Danh sách tin sidebar — text-only */}
                          <div className="flex-1 divide-y divide-border/60">
                            {filteredNews.slice(1, 6).map((item, index) => (
                              <Link
                                key={item.id}
                                href={`/tin-tuc/${item.slug}`}
                                className="group flex gap-3 p-3.5 hover:bg-cream/40 btn-transition"
                              >
                                {/* Số thứ tự */}
                                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-cream flex items-center justify-center text-[10px] font-bold text-text-muted group-hover:bg-primary group-hover:text-white btn-transition">
                                  {index + 2}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-[12px] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary btn-transition">
                                    {item.title}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TAG_COLORS[item.tag] || 'bg-primary/10 text-primary'}`}>
                                      {item.tag}
                                    </span>
                                    <span className="text-[10px] text-text-muted">{timeAgo(item.date)}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grid các bài còn lại */}
                    {filteredNews.length > 6 && (
                      <>
                        {/* Phân cách */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-1 h-5 bg-accent rounded-full" />
                          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                            Tin tức khác
                          </h3>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredNews.slice(6, 6 + currentPage * ITEMS_PER_PAGE).map((item) => (
                            <article
                              key={item.id}
                              className="rounded-2xl border border-border bg-white overflow-hidden hover:-translate-y-0.5 hover:shadow-lg btn-transition"
                            >
                              <Link href={`/tin-tuc/${item.slug}`} className="group block">
                                {/* Ảnh */}
                                <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover object-top group-hover:scale-105 btn-transition"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                  />
                                </div>

                                {/* Nội dung */}
                                <div className="p-5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${TAG_COLORS[item.tag] || 'bg-primary/10 text-primary'}`}>
                                      {item.tag}
                                    </span>
                                    <span className="text-[10px] text-text-muted">{timeAgo(item.date)}</span>
                                  </div>
                                  <h3 className="text-sm font-bold text-text-primary leading-snug mb-2 line-clamp-2 group-hover:text-primary btn-transition">
                                    {item.title}
                                  </h3>
                                  <p className="text-xs text-text-secondary line-clamp-2">{item.excerpt}</p>
                                </div>
                              </Link>
                            </article>
                          ))}
                        </div>
                        {/* Nút xem thêm */}
                        {filteredNews.length > 6 + currentPage * ITEMS_PER_PAGE && (
                          <div className="col-span-full flex justify-center pt-4">
                            <button
                              onClick={() => setCurrentPage(p => p + 1)}
                              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark btn-transition"
                            >
                              Xem thêm tin tức ({filteredNews.length - 6 - currentPage * ITEMS_PER_PAGE} bài còn lại)
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Nguồn */}
                <div className="mt-8 text-center">
                  <a
                    href="https://www.facebook.com/phuongxuanhoatphochiminh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-muted bg-cream inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary btn-transition"
                  >
                    📱 Theo dõi Facebook Phường Xuân Hòa để cập nhật thêm
                  </a>
                </div>
              </>
            )}
          </NewsTabs>
        </div>
      </section>
    </>
  )
}
