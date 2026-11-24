import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export const NOTICE_CATEGORIES_PAGE_KEY = 'public-notice-categories'
export const NOTICE_CATEGORIES_FILE = join(process.cwd(), 'data', 'niem-yet-categories.json')

export type PublicNoticeCategory = {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
}

const DEFAULT_CATEGORIES: PublicNoticeCategory[] = [
  { id: 'cai-cach-tthc', name: 'Cải cách TTHC', slug: 'cai-cach-tthc', sortOrder: 1, isActive: true },
  { id: 'chi-dao-dieu-hanh', name: 'Chỉ đạo điều hành', slug: 'chi-dao-dieu-hanh', sortOrder: 2, isActive: true },
  { id: 'thu-tuc-hc', name: 'Thủ tục HC', slug: 'thu-tuc-hc', sortOrder: 3, isActive: true },
  { id: 'tai-chinh-ngan-sach', name: 'Tài chính - Ngân sách', slug: 'tai-chinh-ngan-sach', sortOrder: 4, isActive: true },
  { id: 'quy-hoach', name: 'Quy hoạch', slug: 'quy-hoach', sortOrder: 5, isActive: true },
  { id: 'thong-bao', name: 'Thông báo', slug: 'thong-bao', sortOrder: 6, isActive: true },
]

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function normalizeNoticeCategoryName(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 120) : ''
}

export function sanitizeNoticeCategory(value: unknown, fallbackId?: string, fallbackSortOrder = 0): PublicNoticeCategory | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const name = normalizeNoticeCategoryName(raw.name)
  if (!name) return null
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : (fallbackId || `category-${slugify(name)}`)
  const sortOrder = typeof raw.sortOrder === 'number' && Number.isFinite(raw.sortOrder) ? raw.sortOrder : fallbackSortOrder
  return { id, name, slug: slugify(name), sortOrder, isActive: raw.isActive !== false }
}

export function getDefaultNoticeCategories() {
  return DEFAULT_CATEGORIES.map((category) => ({ ...category }))
}

export function normalizeNoticeCategories(value: unknown): PublicNoticeCategory[] {
  if (!Array.isArray(value)) return getDefaultNoticeCategories()
  const categories = value.map((item, index) => sanitizeNoticeCategory(item, undefined, index + 1)).filter(Boolean) as PublicNoticeCategory[]
  if (!categories.length) return getDefaultNoticeCategories()
  const seen = new Set<string>()
  return categories.filter((category) => {
    const key = category.name.toLocaleLowerCase('vi-VN')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))
}

export function readNoticeCategoriesFile() {
  try {
    return normalizeNoticeCategories(JSON.parse(readFileSync(NOTICE_CATEGORIES_FILE, 'utf-8')))
  } catch {
    return getDefaultNoticeCategories()
  }
}

export function writeNoticeCategoriesFile(categories: PublicNoticeCategory[]) {
  writeFileSync(NOTICE_CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8')
}
