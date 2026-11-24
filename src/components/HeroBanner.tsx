/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : HeroBanner — nền xanh công nghệ, bộ nhận diện phường, search bar
 * @lienquan    : public/branding/xuan-hoa-identity-blue.png, public/branding/xuan-hoa-identity-white.png
 * @alias       : hero, banner
 */

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, FileSearch, FileText } from 'lucide-react'
import SiteSearchForm from '@/components/SiteSearchForm'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#eaf7ff]" id="hero-banner">
      <div className="relative flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#12bceb] via-[#0879d7] to-[#034fd3] text-center shadow-2xl shadow-primary/20 md:min-h-[640px]">
        <Image
          src="/branding/xuan-hoa-identity-white.png"
          alt="Bộ nhận diện Phường Xuân Hòa"
          fill
          className="pointer-events-none z-[1] object-cover object-bottom opacity-[0.68] md:opacity-[0.78]"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,67,160,0.12)_0%,rgba(4,113,205,0.48)_32%,rgba(4,113,205,0.58)_50%,rgba(4,113,205,0.48)_68%,rgba(2,67,160,0.12)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(5,111,204,0.82)_0%,rgba(5,111,204,0.66)_36%,rgba(5,111,204,0.18)_66%,transparent_82%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-[#056dc9]/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-[#034fb6]/55 to-transparent" />

        <div className="container-main relative z-[2] flex w-full items-center justify-center py-12 md:py-16">
          <div className="hero-content mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
            <h1 className="font-heading text-[3.1rem] font-bold uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_8px_10px_rgba(2,29,73,0.5)] animate-fade-in-up md:text-[5.6rem] lg:text-[6.75rem]">
              TRUNG TÂM PHỤC VỤ
              <br />
              <span className="mt-2 inline-block text-[#f4c542] drop-shadow-[0_7px_9px_rgba(68,42,0,0.42)] md:mt-3">HÀNH CHÍNH CÔNG</span>
            </h1>

            <div className="mt-7 flex w-full max-w-[680px] items-center justify-center gap-3 text-lg font-bold text-white drop-shadow-[0_3px_5px_rgba(2,43,88,0.66)] animate-fade-in-up stagger-2 md:mt-8 md:text-2xl">
              <span className="hidden h-px flex-1 bg-gradient-to-l from-white/50 to-transparent sm:block" />
              <span className="hidden h-2.5 w-2.5 rounded-full bg-accent sm:block" />
              <p className="shrink-0">Phường Xuân Hòa - TP. Hồ Chí Minh</p>
              <span className="hidden h-2.5 w-2.5 rounded-full bg-accent sm:block" />
              <span className="hidden h-px flex-1 bg-gradient-to-r from-white/50 to-transparent sm:block" />
            </div>
            <p className="mt-4 max-w-full whitespace-nowrap text-[clamp(0.48rem,2vw,1.125rem)] font-semibold text-white drop-shadow-[0_2px_5px_rgba(2,43,88,0.7)] animate-fade-in-up stagger-3 md:mt-5">
              Tra cứu thủ tục hành chính, tải biểu mẫu, theo dõi hồ sơ và nhận hỗ trợ trực tuyến 24/7
            </p>

            <SiteSearchForm
              className="mt-8 animate-fade-in-up stagger-3 md:mt-10 md:w-[48vw] md:min-w-[620px] md:max-w-[760px]"
              placeholder="Tìm thủ tục, tin tức, văn bản..."
              tone="hero"
            />

            <div className="mt-7 flex w-full flex-col items-center justify-center gap-4 animate-fade-in-up stagger-4 sm:flex-row md:gap-5">
              <Link href="/thu-tuc" className="inline-flex w-full max-w-72 items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-primary shadow-lg shadow-blue-950/18 hover:-translate-y-0.5 hover:bg-primary-50 btn-transition sm:w-auto sm:min-w-60 md:min-w-[17rem] md:text-lg" id="cta-tra-cuu">
                <FileSearch className="h-6 w-6" strokeWidth={2.2} />
                Tra cứu thủ tục
              </Link>
              <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer"
                className="inline-flex w-full max-w-80 items-center justify-center gap-3 whitespace-nowrap rounded-full border border-accent-dark bg-accent px-8 py-4 text-sm font-bold text-[#4a3000] shadow-xl shadow-yellow-950/25 hover:bg-accent-light btn-transition sm:w-auto sm:min-w-64 md:min-w-[21rem] md:text-lg" id="cta-nop-ho-so">
                <FileText className="h-6 w-6" strokeWidth={2.2} />
                Nộp hồ sơ trực tuyến
                <ExternalLink className="h-5 w-5" strokeWidth={2.1} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
