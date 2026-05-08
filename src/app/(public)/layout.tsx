/**
 * @nhom        : Layout
 * @chucnang    : Layout trang công dân — Header + Main + Footer
 * @lienquan    : src/components/Header.tsx, src/components/Footer.tsx
 * @alias       : public-layout, layout-cong-dan
 */

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  )
}
