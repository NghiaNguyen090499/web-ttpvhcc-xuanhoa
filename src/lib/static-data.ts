/**
 * @nhom        : Data Access
 * @chucnang    : Đọc dữ liệu tĩnh từ JSON — fallback khi chưa kết nối DB
 * @lienquan    : data/procedures.json, data/ward-info.json
 * @alias       : static-data, fallback, json-data
 *
 * Dữ liệu tĩnh phục vụ:
 * - Static rendering (SSG) cho trang công dân
 * - Fallback khi Supabase không khả dụng
 * - Seed data cho phát triển local
 */

import { readFileSync } from 'fs'
import { join } from 'path'

// Đường dẫn thư mục dữ liệu
const DATA_DIR = join(process.cwd(), 'data')

// ============================================================
// TYPES — Kiểu dữ liệu cho JSON
// ============================================================

/** Tài liệu thủ tục (preview + PDF — lưu local) */
export interface DocumentData {
  title: string
  type: string
  preview: string
  pdf: string
  pageCount: number
}

/** Lĩnh vực TTHC cấp phường */
export interface CategoryData {
  id: string
  name: string
  type: string
  slug: string
  description: string
  subCategories: string[]
  documents?: DocumentData[]
}

/** Lĩnh vực phi địa giới / thường gặp */
export interface SimpleCategoryData {
  id: string
  name: string
  type: string
  slug?: string
  description: string
  preview?: string
  pdf?: string
  pageCount?: number
}

/** Links liên kết ngoài */
export interface ExternalLinks {
  bieuMau: string
  dvcTraCuu: string
  dvcThuTuc: string
  dvcDanhGia: string
  dvcHuongDan: string
  facebook: string
}

/** Thông tin liên hệ */
export interface ContactInfo {
  address: string
  ward: string
  district: string
}

/** Cấu trúc file procedures.json */
export interface ProceduresData {
  metadata: {
    source: string
    crawledAt: string
    totalCategories: number
    totalSubCategories: number
    note: string
  }
  categories: CategoryData[]
  phiDiaGioi: SimpleCategoryData[]
  thuongGap: SimpleCategoryData[]
  externalLinks: ExternalLinks
  contactInfo: ContactInfo
}

/** Thông tin phường */
export interface WardInfoData {
  ward: {
    name: string
    fullName: string
    address: string
    city: string
  }
  center: {
    name: string
    shortName: string
    mission: string
    services: string[]
  }
  workingHours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  socialMedia: {
    facebook: string
    zalo: string
  }
  dvcLinks: {
    national: string
    hcm: string
    traCuu: string
    thuTuc: string
    danhGia: string
    huongDan: string
  }
}

// ============================================================
// DATA LOADERS — Hàm đọc dữ liệu
// ============================================================

// Cache dữ liệu trong bộ nhớ — tránh đọc file nhiều lần
let _proceduresCache: ProceduresData | null = null
let _wardInfoCache: WardInfoData | null = null

/**
 * @chucnang    : Đọc dữ liệu thủ tục hành chính từ JSON
 * @output      : ProceduresData
 */
export function getProceduresData(): ProceduresData {
  if (!_proceduresCache) {
    const raw = readFileSync(join(DATA_DIR, 'procedures.json'), 'utf-8')
    _proceduresCache = JSON.parse(raw) as ProceduresData
  }
  return _proceduresCache
}

/**
 * @chucnang    : Đọc thông tin phường từ JSON
 * @output      : WardInfoData
 */
export function getWardInfo(): WardInfoData {
  if (!_wardInfoCache) {
    const raw = readFileSync(join(DATA_DIR, 'ward-info.json'), 'utf-8')
    _wardInfoCache = JSON.parse(raw) as WardInfoData
  }
  return _wardInfoCache
}

/**
 * @chucnang    : Lấy lĩnh vực cấp phường theo slug
 * @input       : slug (string) — slug của lĩnh vực
 * @output      : CategoryData | undefined
 */
export function getCategoryBySlug(slug: string): CategoryData | undefined {
  const data = getProceduresData()
  return data.categories.find((c) => c.slug === slug)
}

/**
 * @chucnang    : Lấy tất cả lĩnh vực (cấp phường + phi địa giới + thường gặp)
 * @output      : Object chứa 3 mảng
 */
export function getAllCategories() {
  const data = getProceduresData()
  return {
    capPhuong: data.categories,
    phiDiaGioi: data.phiDiaGioi,
    thuongGap: data.thuongGap,
  }
}

/**
 * @chucnang    : Lấy links liên kết ngoài (DVC, biểu mẫu, etc.)
 * @output      : ExternalLinks
 */
export function getExternalLinks(): ExternalLinks {
  return getProceduresData().externalLinks
}

// ============================================================
// TIN TỨC — Types & Loaders
// ============================================================

/** Bài viết tin tức */
export interface NewsItem {
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

// Cache tin tức
let _newsCache: NewsItem[] | null = null

/**
 * @chucnang    : Đọc danh sách tin tức từ JSON
 * @output      : NewsItem[]
 */
export function getNewsData(): NewsItem[] {
  if (!_newsCache) {
    const raw = readFileSync(join(DATA_DIR, 'news.json'), 'utf-8')
    _newsCache = JSON.parse(raw) as NewsItem[]
  }
  return _newsCache
}

/**
 * @chucnang    : Lấy bài viết theo slug
 * @input       : slug (string)
 * @output      : NewsItem | undefined
 */
export function getNewsBySlug(slug: string): NewsItem | undefined {
  return getNewsData().find((n) => n.slug === slug)
}
