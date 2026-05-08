/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Section tin tức trang chủ — layout 2 cột bất đối xứng
 *                Tham khảo: hochiminhcity.gov.vn (featured + sidebar) + ubmttq (phân cấp)
 * @lienquan    : src/components/NewsTabs.tsx, src/lib/static-data.ts
 * @alias       : news-section, tin-tuc-trang-chu
 */

import Image from 'next/image'
import Link from 'next/link'
import { getNewsData } from '@/lib/static-data'
import { TAG_COLORS } from '@/components/NewsTabs'

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
 * @chucnang    : Tính thời gian tương đối (3 ngày trước, 2 tuần trước, etc.)
 * @input       : dateStr (string) — ngày dạng YYYY-MM-DD
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

/**
 * @chucnang    : Section tin tức cho trang chủ — Server Component
 *                Layout: Tin nổi bật (trái) + Sidebar tin mới (phải) + Grid 3 cards bên dưới
 * @output      : JSX section
 */
export default function NewsSection() {
  // Lấy tin tức — bài đầu featured, 4 bài sidebar, 3 bài grid
  const allNews = getNewsData()
  const featured = allNews[0]
  const sidebarNews = allNews.slice(1, 5) // 4 bài cho sidebar
  const gridNews = allNews.slice(5, 8)    // 3 bài cho grid cards

  if (!featured) return null

  return (
    <section className="py-10 md:py-14" id="tin-tuc">
      <div className="container-main">
        {/* Tiêu đề section */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Cập nhật
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Tin tức — Thông báo
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
        </div>

        {/* Layout 2 cột: Featured (trái) + Sidebar (phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          {/* Tin nổi bật — chiếm 3/5 */}
          <div className="lg:col-span-3 animate-fade-in-up">
            <Link
              href={`/tin-tuc/${featured.slug}`}
              className="group block rounded-2xl border border-border bg-white overflow-hidden hover:shadow-xl btn-transition h-full"
            >
              {/* Ảnh lớn */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 btn-transition"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Tag overlay */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm ${TAG_COLORS[featured.tag] || 'bg-primary/10 text-primary'}`}>
                    {featured.tag}
                  </span>
                </div>
                {/* Tiêu đề overlay trên ảnh */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2 drop-shadow-lg">
                    {featured.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 line-clamp-2">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-white/60">{formatDate(featured.date)}</span>
                    <span className="text-[10px] text-white/60">•</span>
                    <span className="text-[10px] text-accent font-medium">{timeAgo(featured.date)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Sidebar tin mới — chiếm 2/5 */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-2">
            <div className="rounded-2xl border border-border bg-white overflow-hidden h-full flex flex-col">
              {/* Header sidebar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-cream/50">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                  Tin mới nhất
                </h4>
              </div>

              {/* Danh sách tin — text-only, tiết kiệm diện tích */}
              <div className="flex-1 divide-y divide-border/60">
                {sidebarNews.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/tin-tuc/${item.slug}`}
                    className="group flex gap-3 p-4 hover:bg-cream/40 btn-transition"
                  >
                    {/* Số thứ tự */}
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-cream flex items-center justify-center text-xs font-bold text-text-muted group-hover:bg-primary group-hover:text-white btn-transition">
                      {index + 2}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary btn-transition">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[item.tag] || 'bg-primary/10 text-primary'}`}>
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

        {/* Grid 3 cards bên dưới */}
        {gridNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {gridNews.map((news, index) => (
              <Link
                key={news.id}
                href={`/tin-tuc/${news.slug}`}
                className={`group block rounded-2xl border border-border bg-white overflow-hidden hover:-translate-y-0.5 hover:shadow-lg btn-transition animate-fade-in-up stagger-${index + 3}`}
              >
                {/* Ảnh */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 btn-transition"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Nội dung */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${TAG_COLORS[news.tag] || 'bg-primary/10 text-primary'}`}>
                      {news.tag}
                    </span>
                    <span className="text-[10px] text-text-muted">{timeAgo(news.date)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary btn-transition">
                    {news.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{news.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Link xem tất cả */}
        <div className="text-center">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cream border border-border text-sm font-semibold text-primary hover:bg-primary hover:text-white hover:border-primary btn-transition"
          >
            Xem tất cả tin tức
            <span className="text-xs opacity-60">({allNews.length} bài)</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
