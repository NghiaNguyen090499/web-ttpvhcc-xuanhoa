/**
 * @nhom        : Lib / Pagination
 * @chucnang    : Helper phân trang dùng chung cho các trang danh sách công khai (?page=N)
 * @lienquan    : src/components/Pagination.tsx
 * @alias       : pagination, phan-trang
 */

export const PAGE_SIZE = 20

export type PageSearchParams = Promise<{ page?: string | string[] }>

/**
 * @chucnang    : Đọc số trang từ query string — giá trị lỗi/âm/thiếu → 1
 */
export function parsePage(value?: string | string[] | null): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || !/^\d{1,6}$/.test(raw)) return 1
  return Math.max(1, Number(raw))
}

export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
  /** Chỉ số (0-based) của mục đầu tiên trong trang — dùng cho số thứ tự liên tục */
  offset: number
  /** true khi trang yêu cầu vượt quá số trang hiện có */
  outOfRange: boolean
}

export function paginate<T>(all: T[], page: number, pageSize = PAGE_SIZE): Paginated<T> {
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  return {
    items: all.slice(offset, offset + pageSize),
    page,
    totalPages,
    total,
    offset,
    outOfRange: page > totalPages,
  }
}

/**
 * @chucnang    : Danh sách số trang hiển thị — tối đa 5 số + dấu …
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (currentPage > 3) pages.push('...')
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (currentPage < totalPages - 2) pages.push('...')
  pages.push(totalPages)
  return pages
}

export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`
}
