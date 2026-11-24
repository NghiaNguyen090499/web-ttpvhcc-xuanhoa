/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Khu vực TIN NỔI BẬT / TIN MỚI — 2 tab, 1 tin chính (trái) + lưới 2×2 tin phụ (phải)
 *                Đổi tab không tải lại trang; dữ liệu do server chọn sẵn (src/lib/home-news.ts)
 * @lienquan    : src/lib/home-news.ts, src/components/HomeContentLayout.tsx
 * @alias       : home-news-tabs, tin-noi-bat, tin-moi
 */

'use client'

import { useId, useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DEFAULT_NEWS_IMAGE, type HomeNewsItem } from '@/lib/home-news'

type TabKey = 'featured' | 'latest'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'featured', label: 'Tin nổi bật' },
  { key: 'latest', label: 'Tin mới' },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
}

function NewsImage({ item, sizes, priority }: { item: HomeNewsItem; sizes: string; priority?: boolean }) {
  const [src, setSrc] = useState(item.image || DEFAULT_NEWS_IMAGE)
  return (
    <Image
      src={src}
      alt={item.title}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition duration-300 group-hover:scale-[1.02]"
      onError={() => { if (src !== DEFAULT_NEWS_IMAGE) setSrc(DEFAULT_NEWS_IMAGE) }}
    />
  )
}

/** Ẩn mô tả khi trống hoặc trùng nguyên văn tiêu đề */
function hasExcerpt(item: HomeNewsItem) {
  const excerpt = item.excerpt.trim()
  return excerpt.length > 0 && excerpt.toLocaleLowerCase('vi') !== item.title.trim().toLocaleLowerCase('vi')
}

function NewsMeta({ item }: { item: HomeNewsItem }) {
  const date = formatDate(item.date)
  if (!date && !item.source) return null
  return (
    <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-3 text-xs text-text-muted md:text-[13px]">
      {item.source && <span className="line-clamp-1">{item.source}</span>}
      {item.source && date && <span aria-hidden="true">·</span>}
      {date && <time dateTime={item.date}>{date}</time>}
    </p>
  )
}

/** Cấu trúc nội dung dùng chung cho cả 2 tab */
function NewsPanelContent({ items, priority }: { items: HomeNewsItem[]; priority: boolean }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">Chưa có tin tức.</p>
    )
  }

  const [main, ...rest] = items
  const secondary = rest.slice(0, 4)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[49fr_51fr] lg:gap-6">
      {/* Tin chính */}
      <Link href={main.href} className="group flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-surface-dark">
          <NewsImage item={main} sizes="(max-width: 1024px) 100vw, 580px" priority={priority} />
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-primary-dark transition group-hover:text-primary md:text-xl lg:text-[22px]">
          {main.title}
        </h3>
        {hasExcerpt(main) && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{main.excerpt}</p>
        )}
        <NewsMeta item={main} />
      </Link>

      {/* 4 tin phụ — lưới 2×2, chiều cao đồng đều */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-2 lg:gap-4">
          {secondary.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col border-b-2 border-[#c5d9ea] bg-[#f5f9fc] p-3.5 transition hover:border-primary hover:bg-primary-50 md:p-4"
            >
              <h4 className="line-clamp-3 text-[15px] font-bold leading-snug text-primary-dark transition group-hover:text-primary md:text-base lg:text-[17px]">
                {item.title}
              </h4>
              {hasExcerpt(item) && (
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-text-secondary">{item.excerpt}</p>
              )}
              <NewsMeta item={item} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function HomeNewsTabs({
  featured,
  latest,
  total,
}: {
  featured: HomeNewsItem[]
  latest: HomeNewsItem[]
  total: number
}) {
  const [active, setActive] = useState<TabKey>('featured')
  const baseId = useId()
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ featured: null, latest: null })
  const data: Record<TabKey, HomeNewsItem[]> = { featured, latest }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const index = TABS.findIndex((tab) => tab.key === active)
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length].key
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="border border-border bg-white px-4 pb-5 pt-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:px-6 md:pb-6" aria-label="Tin tức">
      {/* Thanh tab */}
      <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-primary">
        <div role="tablist" aria-label="Tin tức" className="flex items-center" onKeyDown={onKeyDown}>
          {TABS.map((tab, index) => {
            const selected = tab.key === active
            return (
              <div key={tab.key} className="flex items-center">
                {index > 0 && <span className="mx-3 h-5 w-px bg-border-dark md:mx-4" aria-hidden="true" />}
                <button
                  ref={(el) => { tabRefs.current[tab.key] = el }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${tab.key}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${tab.key}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.key)}
                  className={`relative py-2.5 font-heading text-lg uppercase tracking-wide transition-colors md:text-xl ${
                    selected ? 'font-bold text-primary-dark' : 'font-semibold text-text-muted hover:text-primary'
                  }`}
                >
                  {tab.label}
                  {selected && <span className="absolute inset-x-0 -bottom-0.5 h-[3px] bg-primary-dark" aria-hidden="true" />}
                </button>
              </div>
            )
          })}
        </div>
        <Link
          href="/tin-tuc"
          className="mb-2.5 hidden items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary-dark sm:inline-flex"
        >
          Xem tất cả <span className="font-normal text-text-muted">({total})</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={tab.key !== active}
          className={tab.key === active ? 'animate-fade-in motion-reduce:animate-none' : undefined}
        >
          <NewsPanelContent items={data[tab.key]} priority={tab.key === 'featured'} />
        </div>
      ))}

      <Link
        href="/tin-tuc"
        className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary sm:hidden"
      >
        Xem tất cả tin tức <span className="font-normal text-text-muted">({total})</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
