/**
 * @nhom        : Lib / Trang chủ
 * @chucnang    : Chọn bài cho khu vực TIN NỔI BẬT / TIN MỚI trên trang chủ (1 tin chính + 4 tin phụ)
 * @lienquan    : src/components/HomeNewsTabs.tsx, src/components/HomeContentLayout.tsx, src/lib/portal-db.ts
 * @alias       : home-news, tin-noi-bat, tin-moi
 */

import type { NewsItem } from '@/lib/static-data'

export const HOME_NEWS_COUNT = 5
export const DEFAULT_NEWS_IMAGE = '/images/news/post-01.jpg'

/** Dữ liệu gọn gửi xuống trình duyệt — không kèm nội dung HTML bài viết */
export interface HomeNewsItem {
  id: string
  title: string
  href: string
  image: string
  excerpt: string
  source: string
  date: string
  isFeatured: boolean
}

function toTime(value: string) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function toHomeNewsItem(item: NewsItem): HomeNewsItem {
  return {
    id: item.id,
    title: item.title,
    href: `/tin-tuc/${item.slug}`,
    image: item.image?.trim() || DEFAULT_NEWS_IMAGE,
    excerpt: item.excerpt || '',
    source: item.source || '',
    date: item.date,
    isFeatured: Boolean(item.isFeatured),
  }
}

/**
 * @chucnang    : Tạo danh sách 2 tab
 *   - latest  : 5 bài mới nhất theo ngày đăng
 *   - featured: bài được admin đánh dấu nổi bật (mới nhất trước); nếu chưa đủ 5 thì bổ sung bài mới nhất
 *   Mỗi tab không có bài trùng nhau.
 */
export function buildHomeNewsTabs(news: NewsItem[]) {
  const sorted = [...news].sort((a, b) => toTime(b.date) - toTime(a.date))
  const latest = sorted.slice(0, HOME_NEWS_COUNT)

  const featuredFirst = sorted.filter((item) => item.isFeatured)
  const seen = new Set(featuredFirst.map((item) => item.id))
  const featured = [...featuredFirst, ...sorted.filter((item) => !seen.has(item.id))].slice(0, HOME_NEWS_COUNT)

  return {
    featured: featured.map(toHomeNewsItem),
    latest: latest.map(toHomeNewsItem),
    total: news.length,
  }
}
