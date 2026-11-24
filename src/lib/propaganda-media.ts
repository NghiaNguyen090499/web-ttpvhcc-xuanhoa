import type { TuyenTruyenItem } from '@/lib/static-data'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

export function hasImageExtension(value?: string | null) {
  if (!value) return false

  try {
    const parsed = new URL(value, 'http://local.invalid')
    const pathname = parsed.pathname.toLowerCase()
    return [...IMAGE_EXTENSIONS].some((extension) => pathname.endsWith(extension))
  } catch {
    const clean = value.split('?')[0]?.split('#')[0]?.toLowerCase() || ''
    return [...IMAGE_EXTENSIONS].some((extension) => clean.endsWith(extension))
  }
}

export function isPropagandaImage(item: TuyenTruyenItem) {
  return Boolean(item.mediaUrl)
    && (item.mediaType === 'image'
      || (item.mediaType === 'file' && (hasImageExtension(item.mediaUrl) || hasImageExtension(item.fileName))))
}

export function getFeaturedPropagandaImage(data: TuyenTruyenItem[]) {
  const images = data.filter(isPropagandaImage)
  return images.find((item) => item.isFeatured)
}

/**
 * @chucnang    : Bài viết tuyên truyền (mediaType 'article' hoặc dữ liệu JSON cũ không có mediaType)
 */
export function isPropagandaArticle(item: TuyenTruyenItem) {
  return !item.mediaType || item.mediaType === 'article'
}

const TAG_STYLES: Record<string, { badge: string; iconBg: string }> = {
  blue: { badge: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-100' },
  red: { badge: 'bg-red-50 text-red-700', iconBg: 'bg-red-100' },
  green: { badge: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-100' },
  orange: { badge: 'bg-orange-50 text-orange-700', iconBg: 'bg-orange-100' },
  teal: { badge: 'bg-teal-50 text-teal-700', iconBg: 'bg-teal-100' },
  amber: { badge: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-100' },
}

export function getPropagandaTagStyle(color?: string) {
  return TAG_STYLES[color || ''] || TAG_STYLES.blue
}

export function formatPropagandaDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
}

/**
 * @chucnang    : Tài liệu tuyên truyền (PDF/file không phải ảnh) — hiển thị trên /tuyen-truyen, bấm mở file
 */
export function isPropagandaDocument(item: TuyenTruyenItem) {
  return item.mediaType === 'file' && Boolean(item.mediaUrl) && !isPropagandaImage(item)
}

export function formatFileSize(size?: number) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
