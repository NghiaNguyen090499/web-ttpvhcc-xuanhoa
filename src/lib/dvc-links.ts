/**
 * @nhom        : Lib / Cổng DVC
 * @chucnang    : Đường dẫn Cổng Dịch vụ công Quốc gia sau chuyển giao vận hành
 *                (từ 29/05/2026 do Trung tâm Dữ liệu Quốc gia vận hành).
 *                Hệ thống cũ (VPCP) chuyển sang vpcp.dichvucong.gov.vn — dùng để
 *                tra cứu hồ sơ nộp trước 29/05/2026 và chi tiết thủ tục cũ.
 * @alias       : dvc-links, cong-dvc
 */

export const DVC_PORTAL_URL = 'https://dichvucong.gov.vn'
export const DVC_LEGACY_HOME_URL = 'https://vpcp.dichvucong.gov.vn/p/home/dvc-trang-chu.html'
export const DVC_LEGACY_LOOKUP_URL = 'https://vpcp.dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html'
export const DVC_TRANSITION_DATE = '29/05/2026'

const LEGACY_PATTERNS: Array<[RegExp, string]> = [
  [/^https?:\/\/thutuc\.dichvucong\.gov\.vn\//i, 'https://vpcp.dichvucong.gov.vn/'],
  [/^https?:\/\/(www\.)?dichvucong\.gov\.vn\/p\/home\//i, 'https://vpcp.dichvucong.gov.vn/p/home/'],
]

/** Chuyển link hệ thống DVC cũ sang tên miền vpcp.dichvucong.gov.vn */
export function normalizeDvcUrl(url: string): string {
  for (const [pattern, replacement] of LEGACY_PATTERNS) {
    if (pattern.test(url)) return url.replace(pattern, replacement)
  }
  return url
}

/** Duyệt sâu object/array (dữ liệu JSON từ DB) và chuẩn hóa mọi link DVC cũ */
export function normalizeDvcLinksDeep<T>(value: T): T {
  if (typeof value === 'string') return normalizeDvcUrl(value) as T
  if (Array.isArray(value)) return value.map((item) => normalizeDvcLinksDeep(item)) as T
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeDvcLinksDeep(item)]),
    ) as T
  }
  return value
}
