/**
 * @nhom        : Content / Chuyển đổi số
 * @chucnang    : Kiểu dữ liệu, fallback và loader DB-first cho trang chuyển đổi số
 * @lienquan    : src/app/(public)/chuyen-doi-so/page.tsx, src/app/api/admin/chuyen-doi-so/route.ts
 * @alias       : digital-transformation-content
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '@/lib/db'
import { sanitizeArticleHtml } from '@/lib/html'

export interface DigitalHighlight {
  value: string
  label: string
  note: string
}

export interface DigitalResource {
  id: string
  title: string
  description: string
  url: string
  kind: string
  isActive: boolean
  sortOrder: number
}

export interface DigitalTransformationContent {
  title: string
  content: string
  metadata: {
    summary: string
    updatedAt: string
    highlights: DigitalHighlight[]
    resources: DigitalResource[]
  }
}

const CONTENT_FILE = join(process.cwd(), 'data', 'chuyen-doi-so.json')

const DEFAULT_CONTENT: DigitalTransformationContent = {
  title: 'Chuyển đổi số',
  content: '<h2>Chuyển đổi số vì người dân</h2><p>Phường Xuân Hòa từng bước ứng dụng dữ liệu và công nghệ số để cung cấp dịch vụ công thuận tiện hơn, minh bạch hơn và gần người dân hơn.</p><h3>Người dân có thể bắt đầu từ đâu?</h3><ul><li>Tra cứu thủ tục, thành phần hồ sơ và biểu mẫu trước khi đến Trung tâm.</li><li>Nộp hồ sơ trực tuyến khi thủ tục đã được cung cấp trên Cổng Dịch vụ công.</li><li>Sử dụng định danh điện tử, thanh toán trực tuyến và theo dõi trạng thái hồ sơ.</li><li>Gửi phản ánh, kiến nghị để chính quyền tiếp nhận và cải thiện chất lượng phục vụ.</li></ul><h3>Định hướng tại cơ sở</h3><p>Chuyển đổi số được triển khai gắn với dữ liệu số, dịch vụ công trực tuyến, kỹ năng số cộng đồng và an toàn thông tin. Mục tiêu cuối cùng là giúp cán bộ xử lý công việc hiệu quả hơn và giúp người dân tiếp cận dịch vụ công dễ dàng hơn.</p>',
  metadata: {
    summary: 'Thông tin, hướng dẫn và tài nguyên chuyển đổi số phục vụ người dân, doanh nghiệp trên địa bàn phường Xuân Hòa.',
    updatedAt: '2026-07-24',
    highlights: [
      { value: '01', label: 'Dịch vụ công', note: 'Tra cứu và nộp hồ sơ trực tuyến' },
      { value: '02', label: 'Dữ liệu số', note: 'Đúng, đủ, sạch, sống, thống nhất' },
      { value: '03', label: 'Công dân số', note: 'Kỹ năng số thiết thực cho cộng đồng' },
      { value: '04', label: 'An toàn số', note: 'Bảo vệ tài khoản và thông tin cá nhân' },
    ],
    resources: [
      {
        id: 'dvc-quoc-gia',
        title: 'Cổng Dịch vụ công Quốc gia',
        description: 'Tra cứu và thực hiện dịch vụ công trực tuyến.',
        url: 'https://dichvucong.gov.vn',
        kind: 'Dịch vụ công',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'trung-tam-cds-tphcm',
        title: 'Trung tâm Chuyển đổi số TP.HCM',
        description: 'Tin tức, hướng dẫn và hoạt động chuyển đổi số của Thành phố.',
        url: 'https://dxcenter.hochiminhcity.gov.vn/',
        kind: 'Thông tin chính thức',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'van-ban-chuyen-doi-so',
        title: 'Văn bản chuyển đổi số TP.HCM',
        description: 'Danh mục văn bản, kế hoạch và hướng dẫn liên quan.',
        url: 'https://dxcenter.hochiminhcity.gov.vn/van-ban/',
        kind: 'Văn bản',
        isActive: true,
        sortOrder: 3,
      },
      {
        id: 'so-khoa-hoc-cong-nghe',
        title: 'Sở Khoa học và Công nghệ TP.HCM',
        description: 'Thông tin chuyên ngành và chính sách chuyển đổi số của Thành phố.',
        url: 'https://dost.hochiminhcity.gov.vn/chuyen-doi-so/',
        kind: 'Cổng chuyên ngành',
        isActive: true,
        sortOrder: 4,
      },
    ],
  },
}

function readFallback(): DigitalTransformationContent {
  try {
    return JSON.parse(readFileSync(CONTENT_FILE, 'utf-8')) as DigitalTransformationContent
  } catch {
    return DEFAULT_CONTENT
  }
}

function isValidContent(value: unknown): value is DigitalTransformationContent {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<DigitalTransformationContent>
  return Boolean(
    typeof data.title === 'string'
    && typeof data.content === 'string'
    && data.metadata
    && typeof data.metadata.summary === 'string'
    && typeof data.metadata.updatedAt === 'string'
    && Array.isArray(data.metadata.highlights)
    && Array.isArray(data.metadata.resources)
  )
}

export function sanitizeDigitalContent(content: DigitalTransformationContent): DigitalTransformationContent {
  return {
    title: content.title.trim() || 'Chuyển đổi số',
    content: sanitizeArticleHtml(content.content),
    metadata: {
      summary: content.metadata.summary.trim(),
      updatedAt: content.metadata.updatedAt,
      highlights: content.metadata.highlights
        .map((item) => ({
          value: typeof item.value === 'string' ? item.value.trim() : '',
          label: typeof item.label === 'string' ? item.label.trim() : '',
          note: typeof item.note === 'string' ? item.note.trim() : '',
        }))
        .filter((item) => item.value && item.label)
        .slice(0, 8),
      resources: content.metadata.resources
        .map((item, index) => ({
          id: typeof item.id === 'string' ? item.id.trim() || `resource-${index + 1}` : `resource-${index + 1}`,
          title: typeof item.title === 'string' ? item.title.trim() : '',
          description: typeof item.description === 'string' ? item.description.trim() : '',
          url: typeof item.url === 'string' ? item.url.trim() : '',
          kind: typeof item.kind === 'string' ? item.kind.trim() || 'Tài nguyên' : 'Tài nguyên',
          isActive: item.isActive !== false,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index + 1,
        }))
        .filter((item) => item.title && item.url)
        .slice(0, 20),
    },
  }
}

export async function getDigitalTransformationContent(): Promise<DigitalTransformationContent> {
  const fallback = readFallback()
  if (!prisma) return fallback

  try {
    const page = await prisma.pageContent.findUnique({
      where: { pageKey: 'digital-transformation' },
      select: { title: true, content: true, metadata: true, isActive: true },
    })
    if (!page?.isActive || !page.metadata || !isValidContent({
      title: page.title,
      content: page.content,
      metadata: page.metadata,
    })) {
      return fallback
    }

    return sanitizeDigitalContent({
      title: page.title,
      content: page.content,
      metadata: page.metadata as unknown as DigitalTransformationContent['metadata'],
    })
  } catch (err) {
    console.warn('[PortalDB] Fallback digital-transformation JSON:', err)
    return fallback
  }
}

export { CONTENT_FILE, readFallback }
