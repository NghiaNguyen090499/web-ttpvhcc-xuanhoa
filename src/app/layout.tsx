/**
 * @nhom        : Layout
 * @chucnang    : Root layout — Be Vietnam Pro + Barlow Condensed, SEO, lang="vi"
 * @lienquan    : src/app/globals.css
 * @alias       : root-layout
 */

import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Barlow_Condensed } from 'next/font/google'
import './globals.css'

// Font body — Be Vietnam Pro
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

// Font heading — Barlow Condensed (uppercase, condensed — kế thừa backup)
const barlowCondensed = Barlow_Condensed({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TTPVHCC Phường Xuân Hòa — Cổng Dịch Vụ Công Trực Tuyến',
    template: '%s | TTPVHCC Phường Xuân Hòa',
  },
  description:
    'Cổng Thông Tin Điện Tử TTPVHCC Phường Xuân Hòa - TP.HCM. Tra cứu thủ tục hành chính, nộp hồ sơ trực tuyến, chatbot hỗ trợ 24/7.',
  keywords: ['TTPVHCC', 'Xuân Hòa', 'thủ tục hành chính', 'dịch vụ công', 'TP.HCM'],
  authors: [{ name: 'UBND Phường Xuân Hòa - TP.HCM' }],
  robots: 'index, follow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${barlowCondensed.variable} h-full`}>
      <head>
        {/* Structured Data — GovernmentOffice */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'GovernmentOffice',
              name: 'Trung tâm Phục vụ Hành chính Công Phường Xuân Hòa',
              alternateName: 'TTPVHCC Phường Xuân Hòa',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '99 Trần Quốc Thảo, Phường Xuân Hòa',
                addressLocality: 'TP. Hồ Chí Minh',
                addressCountry: 'VN',
              },
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '07:30', closes: '17:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '07:30', closes: '11:30' },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
