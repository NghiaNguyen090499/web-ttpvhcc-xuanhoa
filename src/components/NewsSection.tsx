/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Section tin tức trang chủ — layout 2 cột 7:3
 *                Cột trái: Tin nổi bật + 3 tin nhỏ
 *                Cột phải: Góc tiện ích (bấm mở modal) + Tổng đài 1022
 *                Tham khảo: ảnh mockup Xuân Hòa + hochiminhcity.gov.vn
 * @lienquan    : src/components/NewsTabs.tsx, src/lib/static-data.ts, src/components/UtilityCorner.tsx
 * @alias       : news-section, tin-tuc-trang-chu
 */

import Image from 'next/image'
import Link from 'next/link'
import { getNewsData, getTuyenTruyenData } from '@/lib/static-data'
import { TAG_COLORS } from '@/components/NewsTabs'
import { UtilityCorner } from '@/components/UtilityCorner'

/**
 * @chucnang    : Format ngày từ ISO sang dạng DD/MM/YYYY
 * @input       : dateStr (string) — ngày dạng YYYY-MM-DD
 * @output      : string — ngày dạng DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Dữ liệu tuyên truyền giờ đọc từ JSON — xem data/tuyen-truyen.json

/**
 * @chucnang    : Section tin tức cho trang chủ — Server Component
 *                Layout 7:3: Tin nổi bật + 3 tin nhỏ (trái) | Banner + Tổng đài 1022 (phải)
 * @output      : JSX section
 */
export default function NewsSection() {
  // Lấy tin tức — bài đầu featured, 3 bài nhỏ
  const allNews = getNewsData()
  const featured = allNews[0]
  const smallNews = allNews.slice(1, 4) // 3 bài tin nhỏ bên dưới

  // Lấy bài tuyên truyền cho Góc tiện ích (cột phải)
  const tuyenTruyenItems = getTuyenTruyenData()

  if (!featured) return null

  return (
    <section className="pt-6 pb-8 md:pt-8 md:pb-10" id="tin-tuc">
      <div className="container-main">
        {/* Tiêu đề section — căn trái theo mockup */}
        <div className="mb-5 flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg md:text-xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Bản tin mới nhất
          </h2>
          {/* Navigation arrows — placeholder */}
          <div className="ml-auto flex gap-2">
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-cream btn-transition" aria-label="Tin trước">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-cream btn-transition" aria-label="Tin sau">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Layout 2 cột: 7:3 */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">

          {/* ========== CỘT TRÁI — 7/10 ========== */}
          <div className="lg:col-span-7">
            {/* Tin nổi bật — ảnh lớn + overlay */}
            <Link
              href={`/tin-tuc/${featured.slug}`}
              className="group block rounded-2xl border border-border bg-white overflow-hidden hover:shadow-xl btn-transition mb-4"
            >
              <div className="relative overflow-hidden bg-surface" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Tags trên ảnh */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-white backdrop-blur-sm">
                    TRỰC TUYẾN
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${TAG_COLORS[featured.tag] || 'bg-white/20 text-white'}`}>
                    {featured.tag}
                  </span>
                </div>
                {/* Tiêu đề overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2 drop-shadow-lg">
                    {featured.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 line-clamp-2 max-w-lg">{featured.excerpt}</p>
                </div>
              </div>
            </Link>

            {/* 3 tin nhỏ — grid ngang */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {smallNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/tin-tuc/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-white overflow-hidden hover:-translate-y-0.5 hover:shadow-lg btn-transition"
                >
                  {/* Ảnh nhỏ */}
                  <div className="relative overflow-hidden bg-surface" style={{ aspectRatio: '16/10' }}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 22vw"
                    />
                    {/* Tag overlay */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${TAG_COLORS[item.tag] || 'bg-white/20 text-white'}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  {/* Nội dung */}
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-xs text-text-muted mb-1">{formatDate(item.date)}</p>
                    <h4 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary btn-transition flex-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1.5 line-clamp-2">{item.excerpt}</p>
                    <span className="text-xs text-primary font-semibold mt-2 inline-flex items-center gap-1 uppercase tracking-wide">
                      Xem nguồn
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========== CỘT PHẢI — 3/10 ========== */}
          <div className="lg:col-span-3 flex h-full flex-col gap-4">

            {/* --- Góc tiện ích — bấm mở modal bài viết --- */}
            <UtilityCorner items={tuyenTruyenItems} />

            {/* --- Tổng đài 1022 --- */}
            <a
              href="tel:1022"
              className="block flex-1 overflow-hidden rounded-2xl border border-border bg-[#dff1ff] transition hover:opacity-95"
              aria-label="Gọi Tổng đài 1022"
            >
              <Image
                src="/images/hotline-1022.png"
                alt="Tổng đài 1022 - 5 kênh phản ánh 24/7"
                width={1952}
                height={806}
                className="h-full w-[106%] max-w-none -translate-x-[3%] object-cover"
                sizes="(max-width: 1024px) 106vw, 340px"
              />
            </a>
          </div>
        </div>

        {/* Link xem tất cả */}
        <div className="mt-6 text-center">
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
