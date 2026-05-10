/**
 * @nhom        : Pages / Trang chủ
 * @chucnang    : Trang chủ — Hero, AnnouncementBanner, QuickAccess, TransparencyStats,
 *                NewsSection (+ Góc tiện ích), ProcedureGrid, DigitalAndNotices,
 *                Văn bản chỉ đạo, ServiceBySubject, CTA, UsefulLinks
 * @lienquan    : src/components/*
 * @alias       : home, trang-chu
 */

import { HeroBanner } from '@/components/HeroBanner'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { QuickAccess } from '@/components/QuickAccess'
import { TransparencyStats } from '@/components/TransparencyStats'
import { ProcedureGrid } from '@/components/ProcedureGrid'
import { ServiceBySubject } from '@/components/ServiceBySubject'
import { DigitalAndNotices } from '@/components/DigitalAndNotices'
import { DocumentDirective } from '@/components/DocumentDirective'
import UsefulLinks from '@/components/UsefulLinks'
import NewsSection from '@/components/NewsSection'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero Banner — ảnh nền + search bar + CTA */}
      <HeroBanner />

      {/* Thanh thông báo trượt — carousel auto-slide (P0-1) */}
      <AnnouncementBanner />

      {/* 6 ô truy cập nhanh + tra cứu hồ sơ inline (P0-3 & P1-8) */}
      <QuickAccess />

      {/* Thống kê minh bạch — count-up animation (P0-4) */}
      <TransparencyStats />

      {/* Section tin tức — đưa lên trước để bản tin nổi bật */}
      <NewsSection />

      {/* Lĩnh vực thủ tục hành chính — 6 card logo tròn */}
      <ProcedureGrid />

      {/* Chuyển đổi số & Niêm yết công khai — 2 cột */}
      <DigitalAndNotices />

      {/* Văn bản chỉ đạo điều hành (Nhóm A) */}
      <DocumentDirective />

      {/* Phân loại theo đối tượng: Công dân & Doanh nghiệp (P0-2) */}
      <ServiceBySubject />

      {/* CTA liên hệ */}
      <section className="py-12 bg-cream">
        <div className="container-main text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Cần hỗ trợ?
          </h2>
          <p className="mt-3 text-sm text-text-secondary max-w-md mx-auto">
            Liên hệ trực tiếp hoặc gửi phản ánh, kiến nghị qua form trực tuyến
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/lien-he" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark btn-transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Gửi phản ánh
            </Link>
            <a href="https://www.facebook.com/phuongxuanhoatphochiminh" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-white btn-transition">
              Facebook chính thức
            </a>
          </div>
        </div>
      </section>

      {/* Liên kết website */}
      <UsefulLinks compact />
    </>
  )
}
