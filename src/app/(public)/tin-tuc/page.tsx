/**
 * @nhom        : Pages / Tin tức
 * @chucnang    : Trang tin tức — layout 2 cột + sidebar + tabs lọc + tìm kiếm
 *                Tham khảo: hochiminhcity.gov.vn (2 cột) + ubmttq (sidebar tin mới/xem nhiều)
 * @lienquan    : src/components/NewsTabs.tsx, src/lib/static-data.ts, data/news.json
 * @alias       : news, tin-tuc
 */

import type { Metadata } from 'next'
import { getNewsData } from '@/lib/static-data'
import NewsPageClient from './NewsPageClient'

export const metadata: Metadata = {
  title: 'Tin tức - Thông báo',
  description: 'Tin tức, thông báo mới nhất từ TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

/**
 * @chucnang    : Server component — đọc data và truyền xuống client
 * @output      : JSX trang tin tức
 */
export default function NewsPage() {
  // Đọc dữ liệu tin tức tĩnh — Server Component
  const news = getNewsData()

  return <NewsPageClient news={news} />
}
