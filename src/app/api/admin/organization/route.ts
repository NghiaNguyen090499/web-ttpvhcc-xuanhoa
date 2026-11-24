/**
 * @nhom        : API Routes / Admin
 * @chucnang    : CRUD cơ cấu tổ chức — đọc/tạo/sửa/xóa node sơ đồ tổ chức
 * @lienquan    : data/organization.json, src/app/admin/gioi-thieu/page.tsx
 * @alias       : admin-organization-api, crud-co-cau-to-chuc
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'

const ORG_FILE = join(process.cwd(), 'data', 'organization.json')

type OrganizationNodeType = 'chairman' | 'vice' | 'department'

interface OrganizationNode {
  id: string
  title: string
  type: OrganizationNodeType
  parentId: string | null
  order: number
  isActive: boolean
  name?: string
  role?: string
  phone?: string
  field?: string
  imageUrl?: string
}

interface OrganizationFile {
  metadata: {
    title: string
    updatedAt: string
    note: string
  }
  nodes: OrganizationNode[]
}

function readOrganization(): OrganizationFile {
  try {
    const raw = readFileSync(ORG_FILE, 'utf-8')
    return JSON.parse(raw) as OrganizationFile
  } catch {
    return {
      metadata: {
        title: 'Cơ cấu tổ chức',
        updatedAt: new Date().toISOString().slice(0, 10),
        note: 'Dữ liệu sơ đồ tổ chức.',
      },
      nodes: [],
    }
  }
}

function writeOrganization(data: OrganizationFile) {
  data.metadata.updatedAt = new Date().toISOString().slice(0, 10)
  writeFileSync(ORG_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function readOrganizationFromDb(): Promise<OrganizationFile> {
  const content = await getAdminDb().pageContent.findUnique({
    where: { pageKey: 'organization' },
  })
  if (!content?.metadata || typeof content.metadata !== 'object') {
    return readOrganization()
  }
  return content.metadata as unknown as OrganizationFile
}

async function writeOrganizationToDb(data: OrganizationFile) {
  data.metadata.updatedAt = new Date().toISOString().slice(0, 10)
  return getAdminDb().pageContent.upsert({
    where: { pageKey: 'organization' },
    update: {
      title: data.metadata.title,
      content: data.metadata.note,
      metadata: data as unknown as object,
      isActive: true,
    },
    create: {
      pageKey: 'organization',
      title: data.metadata.title,
      content: data.metadata.note,
      metadata: data as unknown as object,
      isActive: true,
    },
  })
}

function generateSlug(value: string): string {
  return value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function createUniqueId(title: string, nodes: OrganizationNode[]) {
  const base = generateSlug(title) || 'node'
  let candidate = base
  let index = 2
  while (nodes.some((node) => node.id === candidate)) {
    candidate = `${base}-${index}`
    index += 1
  }
  return candidate
}

function isValidType(type: string): type is OrganizationNodeType {
  return ['chairman', 'vice', 'department'].includes(type)
}

function cleanOptional(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

/** GET — Lấy cơ cấu tổ chức */
export async function GET() {
  const organization = hasDatabase()
    ? await readOrganizationFromDb()
    : readOrganization()
  return NextResponse.json({
    organization,
    total: organization.nodes.length,
  })
}

/** POST — Tạo node mới */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    const title = body.title?.trim()
    const type = body.type || 'department'

    if (!title) {
      return NextResponse.json({ error: 'Tên ô cơ cấu là bắt buộc' }, { status: 400 })
    }

    if (!isValidType(type)) {
      return NextResponse.json({ error: 'Loại ô cơ cấu không hợp lệ' }, { status: 400 })
    }

    const data = hasDatabase()
      ? await readOrganizationFromDb()
      : readOrganization()
    const newNode: OrganizationNode = {
      id: createUniqueId(title, data.nodes),
      title,
      type,
      parentId: body.parentId || null,
      order: Number(body.order) || data.nodes.length + 1,
      isActive: body.isActive ?? true,
      name: cleanOptional(body.name),
      role: cleanOptional(body.role),
      phone: cleanOptional(body.phone),
      field: cleanOptional(body.field),
      imageUrl: cleanOptional(body.imageUrl),
    }

    data.nodes.push(newNode)
    if (hasDatabase()) {
      await writeOrganizationToDb(data)
      await writeAuditLog({
        ...auth.session,
        action: 'CREATE',
        entity: 'organization',
        entityId: newNode.id,
        details: { title: newNode.title },
      })
    } else {
      writeOrganization(data)
    }

    return NextResponse.json({ success: true, node: newNode })
  } catch (err) {
    console.error('[Admin/Organization] Lỗi tạo:', err)
    return NextResponse.json({ error: 'Lỗi tạo ô cơ cấu tổ chức' }, { status: 500 })
  }
}

/** PUT — Cập nhật metadata hoặc node */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    const data = hasDatabase()
      ? await readOrganizationFromDb()
      : readOrganization()

    if (body.action === 'update-metadata') {
      data.metadata = {
        ...data.metadata,
        title: body.title?.trim() || data.metadata.title,
        note: body.note?.trim() || data.metadata.note,
      }
      if (hasDatabase()) {
        await writeOrganizationToDb(data)
        await writeAuditLog({
          ...auth.session,
          action: 'UPDATE',
          entity: 'organization',
          entityId: 'metadata',
        })
      } else {
        writeOrganization(data)
      }
      return NextResponse.json({ success: true, organization: data })
    }

    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID ô cơ cấu' }, { status: 400 })
    }

    const index = data.nodes.findIndex((node) => node.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy ô cơ cấu' }, { status: 404 })
    }

    const type = body.type || data.nodes[index].type
    if (!isValidType(type)) {
      return NextResponse.json({ error: 'Loại ô cơ cấu không hợp lệ' }, { status: 400 })
    }

    data.nodes[index] = {
      ...data.nodes[index],
      title: body.title?.trim() || data.nodes[index].title,
      type,
      parentId: body.parentId || null,
      order: Number(body.order) || data.nodes[index].order,
      isActive: body.isActive ?? data.nodes[index].isActive,
      name: cleanOptional(body.name),
      role: cleanOptional(body.role),
      phone: cleanOptional(body.phone),
      field: cleanOptional(body.field),
      imageUrl: cleanOptional(body.imageUrl),
    }

    if (hasDatabase()) {
      await writeOrganizationToDb(data)
      await writeAuditLog({
        ...auth.session,
        action: 'UPDATE',
        entity: 'organization',
        entityId: data.nodes[index].id,
        details: { title: data.nodes[index].title },
      })
    } else {
      writeOrganization(data)
    }

    return NextResponse.json({ success: true, node: data.nodes[index] })
  } catch (err) {
    console.error('[Admin/Organization] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật cơ cấu tổ chức' }, { status: 500 })
  }
}

/** DELETE — Xóa node và các node con trực tiếp */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID ô cơ cấu' }, { status: 400 })
    }

    const data = hasDatabase()
      ? await readOrganizationFromDb()
      : readOrganization()
    const exists = data.nodes.some((node) => node.id === body.id)
    if (!exists) {
      return NextResponse.json({ error: 'Không tìm thấy ô cơ cấu' }, { status: 404 })
    }

    data.nodes = data.nodes.filter((node) => node.id !== body.id && node.parentId !== body.id)
    if (hasDatabase()) {
      await writeOrganizationToDb(data)
      await writeAuditLog({
        ...auth.session,
        action: 'DELETE',
        entity: 'organization',
        entityId: body.id,
      })
    } else {
      writeOrganization(data)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin/Organization] Lỗi xóa:', err)
    return NextResponse.json({ error: 'Lỗi xóa ô cơ cấu tổ chức' }, { status: 500 })
  }
}
