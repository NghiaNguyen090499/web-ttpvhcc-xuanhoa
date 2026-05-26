/**
 * @nhom        : Pages / Tin tức
 * @chucnang    : Trang tin tức — layout 2 cột + sidebar + tabs lọc + tìm kiếm
 *                Tham khảo: hochiminhcity.gov.vn (2 cột) + ubmttq (sidebar tin mới/xem nhiều)
 * @lienquan    : src/components/NewsTabs.tsx, src/lib/static-data.ts, data/news.json
 * @alias       : news, tin-tuc
 */

import type { Metadata } from 'next'
import { getPortalNewsData } from '@/lib/portal-db'
import NewsPageClient from './NewsPageClient'

export const metadata: Metadata = {
  title: 'Tin tức - Thông báo',
  description: 'Tin tức, thông báo mới nhất từ TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

export const revalidate = 60

/**
 * @chucnang    : Server component — đọc data và truyền xuống client
 * @output      : JSX trang tin tức
 */
export default async function NewsPage() {
  const news = await getPortalNewsData()

  return <NewsPageClient news={news} />
}
