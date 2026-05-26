/**
 * @nhom        : Pages / FAQ
 * @chucnang    : Trang câu hỏi thường gặp — Server Component đọc data
 * @lienquan    : data/faq.json
 * @alias       : faq-page, cau-hoi-thuong-gap
 */

import type { Metadata } from 'next'
import { getPortalFaqData } from '@/lib/portal-db'
import FaqPageClient from './FaqPageClient'

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp (FAQ)',
  description: 'Giải đáp các thắc mắc thường gặp về thủ tục hành chính tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

export const revalidate = 60

export default async function FaqPage() {
  const faqs = await getPortalFaqData()
  return <FaqPageClient faqs={faqs} />
}
