/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : HeroBanner — ảnh trống đồng hoa sen background, search bar, Barlow Condensed heading
 * @lienquan    : public/images/hero-bg.jpg
 * @alias       : hero, banner
 */

import Image from 'next/image'
import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden" id="hero-banner">
      {/* Ảnh nền trống đồng hoa sen */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Nền trống đồng Đông Sơn"
        fill
        className="object-cover object-center"
        priority
        quality={85}
      />
      {/* Overlay gradient — giữ chữ trắng dễ đọc */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50 pointer-events-none" />

      <div className="container-main relative z-10 py-14 md:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-[0.15em] mb-6 animate-fade-in-up">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Phục vụ nhân dân — Liêm chính — Hiệu quả
          </div>

          {/* Heading — Barlow Condensed */}
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide leading-tight mb-4 animate-fade-in-up stagger-1 drop-shadow-lg">
            Trung tâm Phục vụ
            <br />
            <span className="text-accent">Hành chính Công</span>
          </h1>

          <p className="text-base md:text-lg text-white/90 mb-3 animate-fade-in-up stagger-2 font-medium drop-shadow-md">
            Phường Xuân Hòa — TP. Hồ Chí Minh
          </p>
          {/* Dòng mô tả — tăng size, đậm hơn, cùng 1 hàng */}
          <p className="text-sm md:text-base font-semibold text-white/90 mb-8 animate-fade-in-up stagger-3 whitespace-nowrap drop-shadow-md">
            Tra cứu thủ tục hành chính, tải biểu mẫu, theo dõi hồ sơ và nhận hỗ trợ trực tuyến 24/7
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto flex overflow-hidden rounded-2xl bg-white shadow-lg animate-fade-in-up stagger-3">
            <div className="flex flex-1 items-center gap-3 px-4">
              <svg className="w-5 h-5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Tìm theo tên thủ tục hoặc lĩnh vực..."
                className="w-full border-0 bg-transparent py-4 text-sm text-text-primary outline-none placeholder:text-text-muted"
                aria-label="Tìm kiếm thủ tục"
              />
            </div>
            <Link href="/thu-tuc" className="bg-accent px-6 flex items-center text-sm font-bold text-[#5a3200] hover:bg-accent-dark btn-transition whitespace-nowrap">
              Tìm kiếm
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 mb-5 animate-fade-in-up stagger-4">
            <Link href="/thu-tuc" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 btn-transition" id="cta-tra-cuu">
              Tra cứu thủ tục
            </Link>
            <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white text-sm font-semibold rounded-full hover:bg-white/10 btn-transition" id="cta-nop-ho-so">
              Nộp hồ sơ trực tuyến ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

