/**
 * @nhom        : Pages / Error
 * @chucnang    : Trang 404 toàn cục — hướng người dùng quay về trang chủ
 * @lienquan    : src/components/Header.tsx, src/components/Footer.tsx
 * @alias       : not-found, 404
 */

import Link from 'next/link'
import { ArrowLeft, FileSearch, Home, Search } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

const QUICK_LINKS = [
  { href: '/thu-tuc', label: 'Thủ tục hành chính', icon: FileSearch },
  { href: '/tra-cuu', label: 'Tra cứu hồ sơ', icon: Search },
  { href: '/tin-tuc', label: 'Tin tức', icon: FileSearch },
]

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[#f5fbff] bg-[radial-gradient(#d8eefb_1px,transparent_1px)] [background-size:20px_20px]">
        <section className="container-main flex min-h-[68vh] items-center justify-center px-4 py-16">
          <div className="w-full max-w-3xl text-center">
            <p className="font-heading text-[96px] font-bold leading-none text-primary md:text-[132px]">
              404
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide text-text-primary md:text-4xl">
              Không tìm thấy trang
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
              Đường dẫn này không tồn tại hoặc nội dung đã được cập nhật. Anh/chị có thể quay về trang chủ hoặc mở nhanh các mục thường dùng bên dưới.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm btn-transition hover:bg-primary-dark"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Về trang chủ
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-white px-5 py-3 text-sm font-bold text-primary btn-transition hover:bg-cream"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Liên hệ hỗ trợ
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-primary btn-transition hover:border-primary/30 hover:text-primary hover:shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
