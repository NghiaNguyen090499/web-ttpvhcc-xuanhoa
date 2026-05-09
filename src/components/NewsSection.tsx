/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Section tin tức trang chủ — layout 2 cột 7:3
 *                Cột trái: Tin nổi bật + 3 tin nhỏ
 *                Cột phải: Banner tuyên truyền + Tổng đài 1022
 *                Tham khảo: ảnh mockup Xuân Hòa + hochiminhcity.gov.vn
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

// Dữ liệu banner tuyên truyền — có thể đổi sang CMS sau
const BANNERS = [
  {
    icon: '📱',
    label: 'TUYÊN TRUYỀN',
    title: 'Ưu tiên nộp hồ sơ trực tuyến để giảm thời gian chờ',
    desc: 'Khuyến khích người dân nộp hồ sơ trực tuyến tại dichvucong.gov.vn để rút ngắn thời gian xử lý.',
    color: 'bg-primary',
  },
  {
    icon: '🛡️',
    label: 'AN NINH',
    title: 'Cảnh giác với lừa đảo qua mạng xã hội và điện thoại',
    desc: 'Công an phường khuyến cáo không cung cấp thông tin cá nhân, OTP cho người lạ.',
    color: 'bg-blue-600',
  },
  {
    icon: '🌿',
    label: 'MÔI TRƯỜNG',
    title: 'Phân loại rác tại nguồn — cùng xây dựng phường xanh',
    desc: 'Thực hiện phân loại rác sinh hoạt theo quy định, góp phần bảo vệ môi trường.',
    color: 'bg-emerald-600',
  },
]

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

  if (!featured) return null

  return (
    <section className="py-10 md:py-14" id="tin-tuc">
      <div className="container-main">
        {/* Tiêu đề section — căn trái theo mockup */}
        <div className="flex items-center gap-3 mb-6">
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
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 btn-transition"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Tags trên ảnh */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary text-white backdrop-blur-sm">
                    TRỰC TUYẾN
                  </span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm ${TAG_COLORS[featured.tag] || 'bg-white/20 text-white'}`}>
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
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 btn-transition"
                      sizes="(max-width: 768px) 100vw, 22vw"
                    />
                    {/* Tag overlay */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${TAG_COLORS[item.tag] || 'bg-white/20 text-white'}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  {/* Nội dung */}
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-[10px] text-text-muted mb-1">{formatDate(item.date)}</p>
                    <h4 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary btn-transition flex-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2">{item.excerpt}</p>
                    <span className="text-[10px] text-primary font-semibold mt-2 inline-flex items-center gap-1 uppercase tracking-wide">
                      Xem nguồn
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========== CỘT PHẢI — 3/10 ========== */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* --- Banner tuyên truyền --- */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-cream/60">
                <span className="text-sm">📢</span>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  Góc tiện ích
                </h4>
              </div>

              {/* Banner content — hiển thị banner đầu tiên, có thể carousel hóa sau */}
              <div className="p-4">
                {BANNERS.map((banner, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 text-white mb-3 last:mb-0 ${banner.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{banner.icon}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{banner.label}</span>
                    </div>
                    <h5 className="text-sm font-bold leading-snug mb-1.5">
                      {banner.title}
                    </h5>
                    <p className="text-[11px] opacity-80 leading-relaxed line-clamp-2">
                      {banner.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Tổng đài 1022 --- */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-cream/60">
                <span className="text-sm">📞</span>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  Số tổng đài
                </h4>
              </div>
              <div className="p-5 text-center">
                {/* Số tổng đài lớn */}
                <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">Tổng đài</p>
                <p className="text-5xl md:text-6xl font-bold text-primary font-heading leading-none">
                  1022
                </p>
                <div className="w-10 h-0.5 bg-accent mx-auto my-3 rounded-full" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Kênh tiếp nhận phản ánh, kiến nghị và hỗ trợ thông tin cho người dân TP.HCM
                </p>
                <a
                  href="tel:1022"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark btn-transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Gọi ngay
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Link xem tất cả */}
        <div className="text-center mt-8">
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
