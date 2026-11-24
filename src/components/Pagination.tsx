/**
 * @nhom        : Components / Pagination
 * @chucnang    : Thanh phân trang dùng chung.
 *                - Server pages: truyền basePath → render link ?page=N (có URL riêng, Back hoạt động)
 *                - Client pages: truyền onPageChange → render button
 * @lienquan    : src/lib/pagination.ts
 * @alias       : pagination, phan-trang
 */

import Link from 'next/link'
import { getPageNumbers, pageHref } from '@/lib/pagination'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  onPageChange?: (page: number) => void
}

const BASE_ITEM = 'inline-flex items-center justify-center rounded-lg text-sm font-semibold btn-transition'
const NAV_ITEM = `${BASE_ITEM} gap-1 border border-border bg-white px-3 py-2 text-text-primary hover:bg-cream`
const NAV_DISABLED = `${BASE_ITEM} gap-1 border border-border bg-white px-3 py-2 text-text-primary opacity-30 cursor-not-allowed`
const NUMBER_ITEM = `${BASE_ITEM} h-10 min-w-10 px-2 border border-border bg-white text-text-primary hover:bg-cream`
const NUMBER_ACTIVE = `${BASE_ITEM} h-10 min-w-10 px-2 bg-primary text-white shadow-sm`

function PrevIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function Pagination({ currentPage, totalPages, basePath, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const renderItem = (page: number, className: string, content: React.ReactNode, label: string, current = false) => {
    if (basePath !== undefined) {
      return (
        <Link
          href={pageHref(basePath, page)}
          className={className}
          aria-label={label}
          aria-current={current ? 'page' : undefined}
        >
          {content}
        </Link>
      )
    }
    return (
      <button
        type="button"
        onClick={() => onPageChange?.(page)}
        className={className}
        aria-label={label}
        aria-current={current ? 'page' : undefined}
      >
        {content}
      </button>
    )
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      {hasPrev
        ? renderItem(currentPage - 1, NAV_ITEM, <><PrevIcon />Trước</>, 'Trang trước')
        : <span className={NAV_DISABLED} aria-hidden="true"><PrevIcon />Trước</span>}

      {getPageNumbers(currentPage, totalPages).map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-text-muted" aria-hidden="true">…</span>
        ) : (
          <span key={page}>
            {renderItem(page, page === currentPage ? NUMBER_ACTIVE : NUMBER_ITEM, page, `Trang ${page}`, page === currentPage)}
          </span>
        )
      )}

      {hasNext
        ? renderItem(currentPage + 1, NAV_ITEM, <>Sau<NextIcon /></>, 'Trang sau')
        : <span className={NAV_DISABLED} aria-hidden="true">Sau<NextIcon /></span>}
    </nav>
  )
}

/**
 * @chucnang    : Dòng "Hiển thị 21–40 / 57" — đặt cạnh tiêu đề danh sách
 */
export function PageRangeInfo({ offset, count, total, unit }: { offset: number; count: number; total: number; unit: string }) {
  if (total === 0) return null
  return (
    <p className="text-sm text-text-muted">
      {total > count ? `Hiển thị ${offset + 1}–${offset + count} / ${total} ${unit}` : `${total} ${unit}`}
    </p>
  )
}
