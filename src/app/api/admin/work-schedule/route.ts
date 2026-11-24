/**
 * @nhom        : API Routes / Admin
 * @chucnang    : Quản lý file PDF lịch công tác tuần trong PageContent.metadata
 * @lienquan    : src/app/admin/lich-cong-tac/page.tsx, src/lib/static-data.ts
 * @alias       : admin-work-schedule-api, admin-lich-cong-tac
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { Prisma } from '@prisma/client'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDb, hasDatabase, writeAuditLog } from '@/lib/admin-db'
import {
  clearLichCongTacCache,
  getLichCongTac,
  type LichTrucEntry,
  type LichCongTacData,
  withDefaultWorkScheduleFile,
} from '@/lib/static-data'
import {
  parseWorkScheduleFileName,
  type WorkScheduleFileMeta,
} from '@/lib/work-schedule-file'

const PAGE_KEY = 'lich-cong-tac'
const SCHEDULE_FILE = join(process.cwd(), 'data', 'lich-cong-tac.json')
const PAGE_TITLE = 'Lịch công tác tuần'
const PAGE_CONTENT = 'Lịch công tác tuần của lãnh đạo UBND Phường Xuân Hòa'

function isLichCongTacData(value: unknown): value is LichCongTacData {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).lichTuan))
}

function readJsonData(): LichCongTacData {
  try {
    return withDefaultWorkScheduleFile(JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8')) as LichCongTacData)
  } catch {
    return getLichCongTac()
  }
}

function toJsonData(data: LichCongTacData) {
  return JSON.parse(JSON.stringify(data)) as LichCongTacData
}

async function readCurrentData(): Promise<LichCongTacData> {
  const fallback = readJsonData()
  if (!hasDatabase()) return fallback

  try {
    const content = await getAdminDb().pageContent.findUnique({
      where: { pageKey: PAGE_KEY },
      select: { metadata: true },
    })

    return isLichCongTacData(content?.metadata)
      ? withDefaultWorkScheduleFile(content.metadata as LichCongTacData)
      : fallback
  } catch {
    return fallback
  }
}

function normalizeDate(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : fallback
}

function normalizeWeekNumber(value: unknown, fallback: number) {
  const week = Number(value)
  return Number.isInteger(week) && week >= 0 && week <= 53 ? week : fallback
}

function normalizeStringArray(value: unknown, fallback: string[] | undefined) {
  if (!Array.isArray(value)) return fallback
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function normalizeLichTruc(value: unknown, fallback: LichTrucEntry[] | undefined) {
  if (!Array.isArray(value)) return fallback

  return value
    .map((item) => {
      const row = item && typeof item === 'object' ? item as Partial<LichTrucEntry> : {}
      const ngay = normalizeDate(row.ngay, '')
      if (!ngay) return null

      return {
        thu: String(row.thu || '').trim(),
        ngay,
        lanhDaoTruc: String(row.lanhDaoTruc || '').trim(),
        chucVu: String(row.chucVu || '').trim(),
        noiDung: String(row.noiDung || '').trim(),
      } satisfies LichTrucEntry
    })
    .filter((item): item is LichTrucEntry => Boolean(item))
}

function isAllowedFileUrl(value: string) {
  return /^\/uploads\/lich-cong-tac\/[^?#]+\.pdf$/i.test(value)
    || /^\/files\/Lich\/[^?#]+\.pdf$/i.test(value)
}

function normalizeFile(value: unknown): WorkScheduleFileMeta | undefined {
  if (!value || typeof value !== 'object') return undefined

  const input = value as Partial<WorkScheduleFileMeta>
  const fileUrl = String(input.fileUrl || '').trim()
  const fileName = String(input.fileName || '').trim()

  if (!fileUrl || !fileName || !isAllowedFileUrl(fileUrl)) return undefined

  const uploadedAt = input.uploadedAt && !Number.isNaN(Date.parse(input.uploadedAt))
    ? input.uploadedAt
    : new Date().toISOString()
  const parsed = parseWorkScheduleFileName(fileName, new Date(uploadedAt))

  return {
    fileUrl,
    fileName,
    fileSize: typeof input.fileSize === 'number' ? input.fileSize : undefined,
    mimeType: input.mimeType || 'application/pdf',
    uploadedAt,
    title: String(input.title || parsed.title || PAGE_TITLE).trim(),
    weekFrom: input.weekFrom,
    weekTo: input.weekTo,
  }
}

function buildNextData(current: LichCongTacData, body: Record<string, unknown>): LichCongTacData {
  const inputMetadata = body.metadata && typeof body.metadata === 'object'
    ? body.metadata as Record<string, unknown>
    : body
  const hasFileInput = Object.prototype.hasOwnProperty.call(body, 'file')
  const incomingFile = hasFileInput
    ? normalizeFile(body.file)
    : current.metadata.file
  const parsed = incomingFile
    ? parseWorkScheduleFileName(incomingFile.fileName, new Date(incomingFile.uploadedAt))
    : undefined
  const lichTruc = normalizeLichTruc(body.lichTruc, current.lichTruc)

  const tuanTu = normalizeDate(inputMetadata.tuanTu, parsed?.tuanTu || current.metadata.tuanTu)
  const tuanDen = normalizeDate(inputMetadata.tuanDen, parsed?.tuanDen || current.metadata.tuanDen)
  const nextFile = incomingFile
    ? {
        ...incomingFile,
        weekFrom: tuanTu || incomingFile.weekFrom,
        weekTo: tuanDen || incomingFile.weekTo,
      }
    : undefined

  return toJsonData({
    ...current,
    metadata: {
      ...current.metadata,
      tuanSo: normalizeWeekNumber(inputMetadata.tuanSo, parsed?.tuanSo || current.metadata.tuanSo),
      tuanTu,
      tuanDen,
      capNhat: normalizeDate(inputMetadata.capNhat, new Date().toISOString().slice(0, 10)),
      nguoiDuyet: String(inputMetadata.nguoiDuyet || current.metadata.nguoiDuyet || 'Văn phòng UBND Phường Xuân Hòa').trim(),
      file: nextFile,
      fileDisabled: hasFileInput && !nextFile ? true : undefined,
      gioLamViec: normalizeStringArray(inputMetadata.gioLamViec, current.metadata.gioLamViec),
      diaDiemTruSo: normalizeStringArray(inputMetadata.diaDiemTruSo, current.metadata.diaDiemTruSo),
    },
    lichTruc,
    lichTuan: lichTruc && lichTruc.length > 0 ? [] : current.lichTuan,
  })
}

async function persistData(data: LichCongTacData) {
  if (hasDatabase()) {
    await getAdminDb().pageContent.upsert({
      where: { pageKey: PAGE_KEY },
      update: {
        title: PAGE_TITLE,
        content: PAGE_CONTENT,
        metadata: data as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
      create: {
        pageKey: PAGE_KEY,
        title: PAGE_TITLE,
        content: PAGE_CONTENT,
        metadata: data as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    })
    return
  }

  writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2), 'utf-8')
  clearLichCongTacCache()
}

export async function GET() {
  const auth = await requireAdminSession('VIEWER')
  if (auth.response) return auth.response

  const data = await readCurrentData()
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession('EDITOR')
    if (auth.response) return auth.response

    const body = await request.json() as Record<string, unknown>
    const current = await readCurrentData()
    const data = buildNextData(current, body)

    await persistData(data)
    await writeAuditLog({
      ...auth.session,
      action: 'UPDATE',
      entity: PAGE_KEY,
      entityId: PAGE_KEY,
      details: {
        fileName: data.metadata.file?.fileName || null,
        tuanSo: data.metadata.tuanSo,
      },
    })

    revalidatePath('/')
    revalidatePath('/lich-cong-tac')

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[Admin/WorkSchedule] Lỗi cập nhật:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật lịch công tác' }, { status: 500 })
  }
}
