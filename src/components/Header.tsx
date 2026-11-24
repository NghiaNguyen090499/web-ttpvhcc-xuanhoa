/**
 * @nhom        : Components / Layout
 * @chucnang    : Header — tông xanh công nghệ, Barlow Condensed heading
 * @lienquan    : src/components/MobileMenu.tsx
 * @alias       : header, navbar
 */

import Image from 'next/image'
import Link from 'next/link'
import { MobileMenu, type NavItem } from './MobileMenu'

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Thủ tục HC',
    href: '/thu-tuc',
    children: [
      { label: 'Thủ tục Hành chính', href: '/thu-tuc' },
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Tra cứu', href: '/tra-cuu' },
    ],
  },
  {
    label: 'Thông tin',
    href: '/van-ban',
    children: [
      { label: 'Văn bản', href: '/van-ban' },
      { label: 'Lịch công tác', href: '/lich-cong-tac' },
      { label: 'Niêm yết', href: '/niem-yet' },
      { label: 'Chuyển đổi số', href: '/chuyen-doi-so' },
    ],
  },
  {
    label: 'Tuyên truyền',
    href: '/tuyen-truyen',
    children: [
      { label: 'Bài viết tuyên truyền', href: '/tuyen-truyen' },
      { label: 'Video hướng dẫn', href: '/video-huong-dan' },
      { label: 'Thư viện hình ảnh', href: '/hinh-anh' },
    ],
  },
  {
    label: 'Liên hệ',
    href: '/lien-he',
    children: [
      { label: 'Liên hệ & phản ánh', href: '/lien-he' },
      { label: 'Khám phá Xuân Hòa', href: '/dia-diem-noi-bat' },
    ],
  },
  { label: 'Cổng TP.HCM', href: 'https://hochiminhcity.gov.vn/', external: true },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Top bar — xanh công nghệ */}
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
        <nav className="flex items-center justify-between h-16 md:h-20" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-4 shrink-0 md:gap-5">
            <Image src="/images/logo.png" alt="Logo TTPVHCC" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" priority />
            <div className="hidden sm:block space-y-0.5">
              <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.06em] text-text-muted leading-tight md:text-[13px]">Trung tâm Phục vụ Hành chính Công</p>
              <p className="whitespace-nowrap text-sm md:text-base font-bold text-primary leading-tight font-heading uppercase tracking-[0.08em]">Phường Xuân Hòa</p>
            </div>
          </Link>

          <ul className="hidden nav:flex items-center gap-0.5" role="menubar">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.href} role="none" className={item.children?.length ? 'relative group' : undefined}>
                {item.children?.length ? (
                  <>
                    <Link
                      href={item.href}
                      role="menuitem"
                      aria-haspopup="true"
                      className="inline-flex items-center gap-1 px-2 py-2 text-[14px] font-medium text-text-primary rounded-xl hover:text-primary hover:bg-cream btn-transition whitespace-nowrap"
                    >
                      {item.label}
                      <svg className="h-3.5 w-3.5 text-text-muted transition-transform group-hover:rotate-90 group-focus-within:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                      </svg>
                    </Link>
                    <ul
                      role="menu"
                      className={`invisible absolute ${index >= NAV_ITEMS.length - 2 ? 'right-0' : 'left-0'} top-full z-20 min-w-36 translate-y-1 rounded-xl border border-border bg-white p-1 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
                    >
                      {item.children.map((child) => (
                        <li key={child.href} role="none">
                          {child.external ? (
                            <a
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              className="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-cream hover:text-primary btn-transition"
                            >
                              {child.label}
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <Link
                              href={child.href}
                              role="menuitem"
                              className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-cream hover:text-primary btn-transition"
                            >
                              {child.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="inline-flex items-center gap-1 px-2 py-2 text-[14px] font-medium text-text-primary rounded-xl hover:text-primary hover:bg-cream btn-transition whitespace-nowrap"
                  >
                    {item.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link href={item.href} role="menuitem" className="px-2 py-2 text-[14px] font-medium text-text-primary rounded-xl hover:text-primary hover:bg-cream btn-transition whitespace-nowrap">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link href="/admin"
              aria-label="Đăng nhập quản trị"
              title="Đăng nhập quản trị"
              className="hidden nav:inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-xl border border-primary/25 bg-primary text-white shadow-sm btn-transition hover:bg-primary-dark" id="btn-admin-login">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM4 20a8 8 0 1116 0" /></svg>
            </Link>
            <MobileMenu items={NAV_ITEMS} />
          </div>
        </nav>
      </div>
    </header>
  )
}
