/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Tabs lọc tin tức theo chuyên mục — client component
 * @input       : tags (string[]) — danh sách tag, activeTag (string) — tag đang chọn
 * @output      : JSX — thanh tabs + callback khi chọn
 * @lienquan    : src/components/NewsSection.tsx, src/app/(public)/tin-tuc/page.tsx
 * @alias       : news-tabs, filter-tabs, chuyen-muc
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Bảng màu tag — mỗi tag có màu riêng, dùng chung toàn hệ thống
export const TAG_COLORS: Record<string, string> = {
  'Hành chính': 'bg-blue-100 text-blue-700',
  'Đoàn thanh niên': 'bg-green-100 text-green-700',
  'Thiện nguyện': 'bg-pink-100 text-pink-700',
  'Giáo dục': 'bg-purple-100 text-purple-700',
  'Văn hóa': 'bg-amber-100 text-amber-700',
  'Thi đua': 'bg-orange-100 text-orange-700',
  'An ninh': 'bg-red-100 text-red-700',
  'Đối ngoại': 'bg-cyan-100 text-cyan-700',
  'Quy hoạch': 'bg-teal-100 text-teal-700',
  'Y tế': 'bg-emerald-100 text-emerald-700',
  'Công đoàn': 'bg-indigo-100 text-indigo-700',
  'An sinh': 'bg-sky-100 text-sky-700',
}

// Emoji cho mỗi tag — dùng làm icon trực quan
const TAG_ICONS: Record<string, string> = {
  'Hành chính': '🏛️',
  'Đoàn thanh niên': '🌿',
  'Thiện nguyện': '💝',
  'Giáo dục': '📚',
  'Văn hóa': '🎭',
  'Thi đua': '🏆',
  'An ninh': '🛡️',
  'Đối ngoại': '🌐',
  'Quy hoạch': '🗺️',
  'Y tế': '🏥',
  'Công đoàn': '👷',
  'An sinh': '🤝',
}

/** Kiểu dữ liệu tin tức (import từ static-data) */
interface NewsItem {
  id: string
  title: string
  slug: string
  date: string
  tag: string
  image: string
  images?: string[]
  excerpt: string
  content: string
  source: string
}

interface NewsTabsProps {
  /** Danh sách tất cả tin tức */
  allNews: NewsItem[]
  /** Component render danh sách tin đã lọc */
  children: (filteredNews: NewsItem[], activeTag: string) => React.ReactNode
}

/**
 * @chucnang    : Tabs lọc tin tức — tự trích xuất danh sách tag từ data
 * @input       : allNews (NewsItem[]) — toàn bộ tin, children (render function)
 * @output      : JSX — tabs + rendered children
 */
export default function NewsTabs({ allNews, children }: NewsTabsProps) {
  const [activeTag, setActiveTag] = useState('Tất cả')

  // Trích xuất danh sách tag duy nhất từ data, sắp xếp theo số lượng bài
  const tags = useMemo(() => {
    const tagCount: Record<string, number> = {}
    allNews.forEach((item) => {
      tagCount[item.tag] = (tagCount[item.tag] || 0) + 1
    })
    // Sắp xếp theo số lượng bài giảm dần
    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
    return ['Tất cả', ...sorted]
  }, [allNews])

  // Lọc tin theo tag đang chọn
  const filteredNews = useMemo(() => {
    if (activeTag === 'Tất cả') return allNews
    return allNews.filter((item) => item.tag === activeTag)
  }, [allNews, activeTag])

  // Xử lý chọn tab
  const handleTabClick = useCallback((tag: string) => {
    setActiveTag(tag)
  }, [])

  return (
    <div>
      {/* Thanh tabs — cuộn ngang trên mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
        {tags.map((tag) => {
          const isActive = tag === activeTag
          const count = tag === 'Tất cả' 
            ? allNews.length 
            : allNews.filter((n) => n.tag === tag).length
          const icon = TAG_ICONS[tag] || '📄'

          return (
            <button
              key={tag}
              onClick={() => handleTabClick(tag)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold
                whitespace-nowrap btn-transition shrink-0 cursor-pointer
                ${isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white border border-border text-text-secondary hover:bg-cream hover:border-primary/30 hover:text-primary'
                }
              `}
            >
              {tag !== 'Tất cả' && <span className="text-sm">{icon}</span>}
              {tag}
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded-full font-bold
                ${isActive ? 'bg-white/20 text-white' : 'bg-cream text-text-muted'}
              `}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Render children với dữ liệu đã lọc */}
      {children(filteredNews, activeTag)}
    </div>
  )
}

/**
 * @chucnang    : Thanh tìm kiếm tin tức — filter realtime theo tiêu đề
 * @input       : onSearch (callback) — hàm xử lý khi nhập
 * @output      : JSX — input search
 */
export function NewsSearch({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Tìm kiếm tin tức..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          btn-transition"
      />
    </div>
  )
}
