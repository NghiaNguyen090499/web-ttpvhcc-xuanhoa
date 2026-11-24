/**
 * @nhom        : Utilities / Lịch công tác
 * @chucnang    : Parse tên file PDF lịch công tác và chuẩn hóa metadata file
 * @lienquan    : src/lib/static-data.ts, src/app/admin/lich-cong-tac/page.tsx
 * @alias       : work-schedule-file, lich-cong-tac-file
 */

export interface WorkScheduleFileMeta {
  fileUrl: string
  fileName: string
  fileSize?: number
  mimeType?: string
  uploadedAt: string
  title: string
  weekFrom?: string
  weekTo?: string
}

export interface ParsedWorkScheduleFileName {
  title: string
  tuanTu?: string
  tuanDen?: string
  tuanSo?: number
}

interface UploadedWorkScheduleFile {
  url: string
  fileName: string
  fileSize?: number
  mimeType?: string
}

function stripExtension(fileName: string) {
  return fileName
    .replace(/\.signed\.pdf$/i, '')
    .replace(/\.pdf$/i, '')
    .trim()
}

function normalizeForMatch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTitle(value: string) {
  return stripExtension(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toFullYear(value: string | undefined, fallbackYear: number) {
  if (!value) return fallbackYear
  const year = Number(value)
  if (!Number.isFinite(year)) return fallbackYear
  return year < 100 ? 2000 + year : year
}

function toIsoDate(day: number, month: number, year: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10)
}

export function getIsoWeekNumber(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00.000Z`)
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNumber = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function parseWorkScheduleFileName(fileName: string, referenceDate = new Date()): ParsedWorkScheduleFileName {
  const title = normalizeTitle(fileName) || 'Lịch công tác tuần'
  const normalized = normalizeForMatch(stripExtension(fileName))
  const rangeMatch = normalized.match(
    /tu\s+ngay\s+(\d{1,2})\s*[-/.]\s*(\d{1,2})(?:\s*[-/.]\s*(\d{2,4}))?.*?den\s+ngay\s+(\d{1,2})\s*[-/.]\s*(\d{1,2})(?:\s*[-/.]\s*(\d{2,4}))?/
  )

  if (!rangeMatch) {
    return { title }
  }

  const [, fromDayValue, fromMonthValue, fromYearValue, toDayValue, toMonthValue, toYearValue] = rangeMatch
  const fromDay = Number(fromDayValue)
  const fromMonth = Number(fromMonthValue)
  const toDay = Number(toDayValue)
  const toMonth = Number(toMonthValue)

  if (!fromDay || !fromMonth || !toDay || !toMonth) {
    return { title }
  }

  const baseYear = referenceDate.getFullYear()
  const fromYear = toFullYear(fromYearValue, baseYear)
  let toYear = toFullYear(toYearValue, fromYear)

  if (!toYearValue && toMonth < fromMonth) {
    toYear = fromYear + 1
  }

  const tuanTu = toIsoDate(fromDay, fromMonth, fromYear)
  const tuanDen = toIsoDate(toDay, toMonth, toYear)

  return {
    title,
    tuanTu,
    tuanDen,
    tuanSo: getIsoWeekNumber(tuanTu),
  }
}

export function formatWorkScheduleFileSize(value?: number) {
  if (!value || value <= 0) return ''
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function buildWorkScheduleFileMeta(
  file: UploadedWorkScheduleFile,
  uploadedAt = new Date()
): WorkScheduleFileMeta {
  const parsed = parseWorkScheduleFileName(file.fileName, uploadedAt)

  return {
    fileUrl: file.url,
    fileName: file.fileName,
    fileSize: file.fileSize,
    mimeType: file.mimeType || 'application/pdf',
    uploadedAt: uploadedAt.toISOString(),
    title: parsed.title || 'Lịch công tác tuần',
    weekFrom: parsed.tuanTu,
    weekTo: parsed.tuanDen,
  }
}
