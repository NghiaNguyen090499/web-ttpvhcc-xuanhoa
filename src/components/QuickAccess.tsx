/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : QuickAccess — 4 nút truy cập nhanh, tông đỏ + kem
 * @lienquan    : src/app/(public)/page.tsx
 * @alias       : quick-access, truy-cap-nhanh
 */

import Link from 'next/link'

const ITEMS = [
  {
    title: 'Nộp hồ sơ',
    desc: 'Nộp hồ sơ trực tuyến qua Cổng DVC',
    href: 'https://dichvucong.gov.vn',
    external: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
  {
    title: 'Tra cứu hồ sơ',
    desc: 'Theo dõi tiến độ xử lý hồ sơ',
    href: 'https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html',
    external: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    ),
  },
  {
    title: 'Biểu mẫu',
    desc: 'Tải biểu mẫu thủ tục hành chính',
    href: '/thu-tuc',
    external: false,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
  {
    title: 'Hướng dẫn',
    desc: 'Hướng dẫn sử dụng dịch vụ công',
    href: '/gioi-thieu',
    external: false,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
]

export function QuickAccess() {
  return (
    <section className="py-8" id="quick-access">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item) => {
            const Wrapper = item.external ? 'a' : Link
            const props = item.external
              ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: item.href }
            return (
              <Wrapper key={item.title} {...(props as any)}
                className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg btn-transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-primary group-hover:bg-primary group-hover:text-white btn-transition">
                  {item.icon}
                </div>
                <h3 className="mt-3 text-sm font-bold text-text-primary">{item.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{item.desc}</p>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
