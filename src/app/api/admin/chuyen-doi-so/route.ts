/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản trị nội dung trang Chuyển đổi số
 * @lienquan    : src/app/admin/chuyen-doi-so/page.tsx, src/lib/digital-transformation.ts
 * @alias       : admin-digital-transformation-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import {
  CONTENT_FILE,
  getDigitalTransformationContent,
  sanitizeDigitalContent,
  type DigitalTransformationContent,
} from '@/lib/digital-transformation'

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function parseBody(body: unknown): DigitalTransformationContent | null {
  if (!body || typeof body !== 'object') return null
  const input = body as Partial<DigitalTransformationContent>
  const metadata = input.metadata
  if (
    typeof input.title !== 'string'
    || typeof input.content !== 'string'
    || !metadata
    || typeof metadata !== 'object'
    || typeof metadata.summary !== 'string'
    || !Array.isArray(metadata.highlights)
    || !Array.isArray(metadata.resources)
  ) {
    return null
  }

  const content = sanitizeDigitalContent({
    title: input.title,
    content: input.content,
    metadata: {
      summary: metadata.summary,
      updatedAt: new Date().toISOString().slice(0, 10),
      highlights: metadata.highlights.map((item) => {
        const value = item as unknown as Record<string, unknown>
        return {
          value: typeof value.value === 'string' ? value.value : '',
          label: typeof value.label === 'string' ? value.label : '',
          note: typeof value.note === 'string' ? value.note : '',
        }
      }),
      resources: metadata.resources.map((item, index) => {
        const value = item as unknown as Record<string, unknown>
        return {
          id: typeof value.id === 'string' ? value.id : `resource-${index + 1}`,
          title: typeof value.title === 'string' ? value.title : '',
          description: typeof value.description === 'string' ? value.description : '',
          url: typeof value.url === 'string' ? value.url : '',
          kind: typeof value.kind === 'string' ? value.kind : 'Tài nguyên',
          isActive: value.isActive !== false,
          sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : index + 1,
        }
      }),
    },
  })

  if (!content.title || !content.metadata.summary || !content.content) return null
  if (content.metadata.resources.some((resource) => !isHttpUrl(resource.url))) return null
  return content
}

export async function GET() {
  return NextResponse.json(await getDigitalTransformationContent())
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const content = parseBody(await request.json())
    if (!content) {
      return NextResponse.json({ error: 'Dữ liệu Chuyển đổi số không hợp lệ' }, { status: 400 })
    }

    if (hasDatabase()) {
      await getAdminDb().pageContent.upsert({
        where: { pageKey: 'digital-transformation' },
        update: {
          title: content.title,
          content: content.content,
          metadata: content.metadata as unknown as object,
          isActive: true,
        },
        create: {
          pageKey: 'digital-transformation',
          title: content.title,
          content: content.content,
          metadata: content.metadata as unknown as object,
          isActive: true,
        },
      })
      await writeAuditLog({
        ...auth.session,
        action: 'UPDATE',
        entity: 'digital-transformation',
        entityId: 'digital-transformation',
      })
    } else {
      writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
    }

    return NextResponse.json({ success: true, content })
  } catch (err) {
    console.error('[Admin/DigitalTransformation] Lỗi lưu:', err)
    return NextResponse.json({ error: 'Không thể lưu nội dung Chuyển đổi số' }, { status: 500 })
  }
}
