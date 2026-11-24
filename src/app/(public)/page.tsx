/**
 * @nhom        : Pages / Trang chủ
 * @chucnang    : Trang chủ — Hero, AnnouncementBanner, QuickAccess, HomeExploreXuanHoa,
 *                HomeContentLayout, ServiceBySubject, CTA, UsefulLinks
 * @lienquan    : src/components/*
 * @alias       : home, trang-chu
 */

import { HeroBanner } from '@/components/HeroBanner'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { QuickAccess } from '@/components/QuickAccess'
import { DvcTransitionNotice } from '@/components/DvcTransitionNotice'
import { ServiceBySubject } from '@/components/ServiceBySubject'
import UsefulLinks from '@/components/UsefulLinks'
import { HomeContentLayout } from '@/components/HomeContentLayout'
import { HomeExploreXuanHoa } from '@/components/HomeExploreXuanHoa'
import Image from 'next/image'
import Link from 'next/link'
import { getPortalTuyenTruyenData } from '@/lib/portal-db'
import { getFeaturedPropagandaImage } from '@/lib/propaganda-media'

export const dynamic = 'force-dynamic'

async function PartyResolutionBanner() {
  const propaganda = await getPortalTuyenTruyenData()
  const featuredImage = getFeaturedPropagandaImage(propaganda)
  const imageSrc = featuredImage?.mediaUrl || '/images/bannermoi.png'
  const imageAlt = featuredImage?.title || 'Trung tâm Phục vụ Hành chính công phường Xuân Hòa — Hành chính phục vụ'
  const isLocalImage = imageSrc.startsWith('/')
  const isExternalImage = /^https?:\/\//i.test(imageSrc) || /^data:image\//i.test(imageSrc) || /^blob:/i.test(imageSrc)
  const isUploadImage = imageSrc.startsWith('/uploads/')
  const isOfficialServiceBanner = imageSrc === '/images/bannermoi.png'
  const bannerAspectClass = isUploadImage
    ? 'aspect-[75/14]'
    : isOfficialServiceBanner
      ? 'aspect-[2172/560]'
      : 'aspect-[1408/230]'
  const bannerImageClass = isUploadImage || isOfficialServiceBanner ? 'object-cover' : 'object-contain'
  const bannerSizes = '(max-width: 1200px) 100vw, 1200px'

  return (
    <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px]">
      <div className="mx-auto max-w-[1200px] px-4 pb-8">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <div className={`relative ${bannerAspectClass} w-full`}>
            {isLocalImage ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className={bannerImageClass}
                sizes={bannerSizes}
                unoptimized={isUploadImage}
              />
            ) : isExternalImage ? (
              <div
                role="img"
                aria-label={imageAlt}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${imageSrc.replace(/"/g, '\\"')}")` }}
              />
            ) : (
              <Image
                src="/images/bannermoi.png"
                alt="Trung tâm Phục vụ Hành chính công phường Xuân Hòa — Hành chính phục vụ"
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      {/* Hero Banner — ảnh nền + search bar + CTA */}
      <HeroBanner />

      {/* Thanh thông báo trượt — carousel auto-slide (P0-1) */}
      <AnnouncementBanner />

      {/* Thông báo chuyển giao Cổng DVC Quốc gia (29/05/2026) */}
      <DvcTransitionNotice />

      {/* 6 ô truy cập nhanh + tra cứu hồ sơ inline (P0-3 & P1-8) */}
      <QuickAccess />

      {/* Khám phá địa điểm và ẩm thực Xuân Hòa */}
      <HomeExploreXuanHoa />

      {/* Nội dung chính — tin tức, tuyên truyền, lĩnh vực TTHC + sidebar */}
      <HomeContentLayout />

      {/* Banner tuyên truyền */}
      <PartyResolutionBanner />

      {/* Phân loại theo đối tượng: Công dân & Doanh nghiệp (P0-2) */}
      <ServiceBySubject />

      {/* CTA liên hệ */}
      <section className="bg-cream py-8 md:py-10">
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
