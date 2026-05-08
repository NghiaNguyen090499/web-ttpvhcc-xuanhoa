/**
 * @nhom        : Components / Layout
 * @chucnang    : Header — tông đỏ chính phủ, Barlow Condensed heading
 * @lienquan    : src/components/MobileMenu.tsx
 * @alias       : header, navbar
 */

import Image from 'next/image'
import Link from 'next/link'
import { MobileMenu } from './MobileMenu'

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Thủ tục HC', href: '/thu-tuc' },
  { label: 'Tra cứu', href: '/tra-cuu' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Liên kết', href: '/lien-ket' },
  { label: 'Liên hệ', href: '/lien-he' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Top bar — đỏ chính phủ */}
      <div className="bg-primary text-white text-xs hidden md:block">
        <div className="container-main flex justify-between items-center py-1.5">
          <span className="flex items-center gap-1.5 opacity-90">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            99 Trần Quốc Thảo, P. Xuân Hòa, TP.HCM
          </span>
          <span className="flex items-center gap-1.5 opacity-90">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            T2–T6: 07:30–17:00 | T7: 07:30–11:30
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="container-main">
        <nav className="flex items-center justify-between h-16 md:h-[72px]" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/images/logo.png" alt="Logo TTPVHCC" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" priority />
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted leading-tight">Trung tâm Phục vụ Hành chính Công</p>
              <p className="text-sm md:text-base font-bold text-primary leading-tight font-heading uppercase tracking-wide">Phường Xuân Hòa</p>
            </div>
          </Link>

          <ul className="hidden nav:flex items-center gap-0.5" role="menubar">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} role="none">
                <Link href={item.href} role="menuitem" className="px-2.5 py-2 text-[13px] font-medium text-text-primary rounded-xl hover:text-primary hover:bg-cream btn-transition whitespace-nowrap">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer"
              className="hidden nav:inline-flex items-center gap-2 px-3.5 py-2 bg-accent text-[#5a3200] text-[13px] font-bold rounded-xl hover:bg-accent-dark btn-transition shadow-sm" id="btn-nop-ho-so">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Nộp hồ sơ online
            </a>
            <MobileMenu items={NAV_ITEMS} />
          </div>
        </nav>
      </div>
    </header>
  )
}
