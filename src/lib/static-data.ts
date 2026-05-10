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

// ============================================================
// NIÊM YẾT — Types & Loaders
// ============================================================

/** Văn bản niêm yết công khai */
export interface NiemYetItem {
  id: string
  title: string
  category?: string
  fileUrl: string
  fileType: 'pdf' | 'image' | 'doc'
  publishedAt: string
  description?: string
}

// Cache niêm yết
let _niemYetCache: NiemYetItem[] | null = null

/**
 * @chucnang    : Đọc danh sách niêm yết từ JSON
 * @output      : NiemYetItem[]
 */
export function getNiemYetData(): NiemYetItem[] {
  if (!_niemYetCache) {
    try {
      const raw = readFileSync(join(DATA_DIR, 'niem-yet.json'), 'utf-8')
      _niemYetCache = JSON.parse(raw) as NiemYetItem[]
    } catch {
      // File chưa có hoặc rỗng — trả mảng rỗng
      _niemYetCache = []
    }
  }
  return _niemYetCache
}

// ============================================================
// LỊCH CÔNG TÁC — Types & Loaders
// ============================================================

/** Một mục trong lịch công tác */
export interface LichCongTacEntry {
  thoiGian: string
  noiDung: string
  chuTri: string
  diaDiem: string
  ghiChu: string
}

/** Lịch 1 ngày trong tuần */
export interface LichNgay {
  thu: string
  ngay: string
  items: LichCongTacEntry[]
}

/** Cấu trúc file lich-cong-tac.json */
export interface LichCongTacData {
  metadata: {
    tuanSo: number
    tuanTu: string
    tuanDen: string
    capNhat: string
    nguoiDuyet: string
  }
  lichTuan: LichNgay[]
}

// Cache lịch công tác
let _lichCongTacCache: LichCongTacData | null = null

/**
 * @chucnang    : Đọc lịch công tác tuần từ JSON
 * @output      : LichCongTacData
 */
export function getLichCongTac(): LichCongTacData {
  if (!_lichCongTacCache) {
    try {
      const raw = readFileSync(join(DATA_DIR, 'lich-cong-tac.json'), 'utf-8')
      _lichCongTacCache = JSON.parse(raw) as LichCongTacData
    } catch {
      _lichCongTacCache = {
        metadata: { tuanSo: 0, tuanTu: '', tuanDen: '', capNhat: '', nguoiDuyet: '' },
        lichTuan: []
      }
    }
  }
  return _lichCongTacCache
}

// ============================================================
// LỊCH TIẾP CÔNG DÂN — Types & Loaders
// ============================================================

/** Một buổi tiếp công dân */
export interface LichTiepDanEntry {
  ngay: string
  buoi: string
  thoiGian: string
  nguoiTiep: string
  diaDiem: string
  loai: string
  noiDung: string
  ghiChu: string
}

/** Quy định tiếp dân */
export interface QuyDinhTiepDan {
  dinhKy: string
  phoChutich: string
  dotXuat: string
  diaDiem: string
  dienThoai: string
}

/** Cấu trúc file lich-tiep-dan.json */
export interface LichTiepDanData {
  metadata: {
    thang: number
    nam: number
    capNhat: string
    canCu: string
  }
  lichThang: LichTiepDanEntry[]
  quyDinh: QuyDinhTiepDan
}

// Cache lịch tiếp dân
let _lichTiepDanCache: LichTiepDanData | null = null

/**
 * @chucnang    : Đọc lịch tiếp công dân từ JSON
 * @output      : LichTiepDanData
 */
export function getLichTiepDan(): LichTiepDanData {
  if (!_lichTiepDanCache) {
    try {
      const raw = readFileSync(join(DATA_DIR, 'lich-tiep-dan.json'), 'utf-8')
      _lichTiepDanCache = JSON.parse(raw) as LichTiepDanData
    } catch {
      _lichTiepDanCache = {
        metadata: { thang: 0, nam: 0, capNhat: '', canCu: '' },
        lichThang: [],
        quyDinh: { dinhKy: '', phoChutich: '', dotXuat: '', diaDiem: '', dienThoai: '' }
      }
    }
  }
  return _lichTiepDanCache
}

// ============================================================
// VĂN BẢN CHỈ ĐẠO ĐIỀU HÀNH — Types & Loaders
// ============================================================

/** Một văn bản chỉ đạo */
export interface VanBanItem {
  id: string
  soKyHieu: string
  loai: string
  trichYeu: string
  ngayBanHanh: string
  coQuanBanHanh: string
  nguoiKy: string
  linhVuc: string
  fileUrl: string
  trangThai: string
}

// Cache văn bản
let _vanBanCache: VanBanItem[] | null = null

/**
 * @chucnang    : Đọc danh sách văn bản chỉ đạo từ JSON
 * @output      : VanBanItem[]
 */
export function getVanBanData(): VanBanItem[] {
  if (!_vanBanCache) {
    try {
      const raw = readFileSync(join(DATA_DIR, 'van-ban.json'), 'utf-8')
      _vanBanCache = JSON.parse(raw) as VanBanItem[]
    } catch {
      _vanBanCache = []
    }
  }
  return _vanBanCache
}

// ============================================================
// TUYÊN TRUYỀN CỘNG ĐỒNG — Types & Loaders
// ============================================================

/** Một bài tuyên truyền */
export interface TuyenTruyenItem {
  id: string
  icon: string
  tag: string
  tagColor: string
  title: string
  summary: string
  content: string       // Nội dung HTML đầy đủ cho modal
  publishedAt: string
}

// Cache tuyên truyền
let _tuyenTruyenCache: TuyenTruyenItem[] | null = null

/**
 * @chucnang    : Đọc danh sách bài tuyên truyền từ JSON
 * @output      : TuyenTruyenItem[]
 */
export function getTuyenTruyenData(): TuyenTruyenItem[] {
  if (!_tuyenTruyenCache) {
    try {
      const raw = readFileSync(join(DATA_DIR, 'tuyen-truyen.json'), 'utf-8')
      _tuyenTruyenCache = JSON.parse(raw) as TuyenTruyenItem[]
    } catch {
      _tuyenTruyenCache = []
    }
  }
  return _tuyenTruyenCache
}
