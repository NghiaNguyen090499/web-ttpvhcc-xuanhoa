/**
 * @nhom        : Pages / FAQ
 * @chucnang    : Trang câu hỏi thường gặp — Server Component đọc data
 * @lienquan    : data/faq.json
 * @alias       : faq-page, cau-hoi-thuong-gap
 */

import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import FaqPageClient from './FaqPageClient'

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp (FAQ)',
  description: 'Giải đáp các thắc mắc thường gặp về thủ tục hành chính tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

// Đọc FAQ từ JSON
function getFaqData() {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'faq.json'), 'utf-8')
    return JSON.parse(raw) as Array<{
      id: string; question: string; answer: string; category: string;
      isActive: boolean; sortOrder: number; viewCount: number
    }>
  } catch { return [] }
}

export default function FaqPage() {
  const faqs = getFaqData().filter(f => f.isActive !== false)
  return <FaqPageClient faqs={faqs} />
}
