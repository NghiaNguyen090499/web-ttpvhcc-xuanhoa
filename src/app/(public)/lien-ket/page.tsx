/**
 * @nhom        : Pages / Liên kết
 * @chucnang    : Trang liên kết website — cổng thông tin Sở, Ban, Ngành TP.HCM
 * @lienquan    : src/components/UsefulLinks.tsx, data/useful-links.json
 * @alias       : useful-links-page, lien-ket
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import UsefulLinks from '@/components/UsefulLinks'

export const metadata: Metadata = {
  title: 'Liên kết Website',
  description: 'Cổng thông tin Sở, Ban, Ngành và tổ chức tại TP.HCM — liên kết hữu ích cho người dân Phường Xuân Hòa.',
}

export default function UsefulLinksPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Liên kết website</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Liên kết Website
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Các cổng thông tin điện tử của Sở, Ban, Ngành và tổ chức chính trị — xã hội tại TP. Hồ Chí Minh.
          </p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          <UsefulLinks />

          {/* Cổng DVC */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 md:p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Cổng Dịch vụ Công Quốc gia</h3>
                <p className="text-sm text-white/80 mb-4">Tra cứu hồ sơ, nộp hồ sơ trực tuyến, đánh giá chất lượng dịch vụ công</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl hover:bg-white/90 btn-transition">
                    🌐 dichvucong.gov.vn
                  </a>
                  <a href="https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white text-xs font-semibold rounded-xl hover:bg-white/30 btn-transition">
                    🔎 Tra cứu hồ sơ
                  </a>
                  <a href="https://kiosk.hochiminhcity.gov.vn/vi/kiosk/danhgiahcm" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white text-xs font-semibold rounded-xl hover:bg-white/30 btn-transition">
                    ⭐ Đánh giá DVC TP.HCM
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quay lại */}
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline btn-transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
