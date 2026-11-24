/**
 * @nhom        : Utilities / Lịch công tác
 * @chucnang    : Trích xuất lịch lãnh đạo trực từ PDF bằng pdftotext
 * @lienquan    : src/app/api/admin/uploads/route.ts, Dockerfile
 * @alias       : work-schedule-pdf, parse-lich-pdf
 */

import { execFile } from 'child_process'
import { promisify } from 'util'
import type { LichTrucEntry } from '@/lib/static-data'
import { getIsoWeekNumber } from '@/lib/work-schedule-file'

const execFileAsync = promisify(execFile)

const DAY_PATTERN = /(Thứ\s+(?:Hai|Ba|Tư|Năm|Sáu|Bảy)|Chủ\s*nhật)\s*(.*)$/i
const DATE_PATTERN = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(.*)$/

export interface ExtractedWorkSchedulePdf {
  metadata: {
    tuanSo?: number
    tuanTu?: string
    tuanDen?: string
    capNhat?: string
    gioLamViec?: string[]
    diaDiemTruSo?: string[]
  }
  lichTruc: LichTrucEntry[]
}

function toIsoDate(day: number, month: number, year: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10)
}

function dateFromMatch(match: RegExpMatchArray) {
  return toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function parseDateRange(text: string) {
  const match = text.match(/Từ\s+ngày\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[–-]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  if (!match) return {}

  const tuanTu = toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]))
  const tuanDen = toIsoDate(Number(match[4]), Number(match[5]), Number(match[6]))

  return {
    tuanTu,
    tuanDen,
    tuanSo: getIsoWeekNumber(tuanTu),
  }
}

function parsePublishedDate(text: string) {
  const match = text.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i)
  return match ? dateFromMatch(match) : undefined
}

function parseCommonContent(text: string) {
  if (
    text.includes('Thực hiện ký chứng thực bản')
    && text.includes('sao, chữ ký, hợp đồng/giao')
    && text.includes('dịch theo ủy quyền của UBND')
  ) {
    return 'Thực hiện ký chứng thực bản sao, chữ ký, hợp đồng/giao dịch theo ủy quyền của UBND'
  }

  return ''
}

function parseNotes(lines: string[]) {
  const gioLamViec: string[] = []
  const diaDiemTruSo: string[] = []
  let section: 'time' | 'address' | null = null

  for (const rawLine of lines) {
    const line = normalizeSpaces(rawLine)
    if (!line) continue

    if (/^Thời gian làm việc/i.test(line)) {
      section = 'time'
      continue
    }
    if (/^Địa điểm trụ sở/i.test(line)) {
      section = 'address'
      continue
    }
    if (!section) continue

    const cleaned = line.replace(/^[-•]\s*/, '')
    if (section === 'time') gioLamViec.push(cleaned)
    if (section === 'address') diaDiemTruSo.push(cleaned)
  }

  return { gioLamViec, diaDiemTruSo }
}

export function parseWorkSchedulePdfText(text: string): ExtractedWorkSchedulePdf {
  const lines = text.split(/\r?\n/)
  const commonContent = parseCommonContent(text)
  const lichTruc: LichTrucEntry[] = []

  lines.forEach((rawLine, index) => {
    const line = normalizeSpaces(rawLine)
    const dayMatch = line.match(DAY_PATTERN)
    if (!dayMatch) return

    const thu = normalizeSpaces(dayMatch[1])
    const lanhDaoTruc = normalizeSpaces(dayMatch[2] || '')
    let ngay = ''
    let chucVu = ''

    for (let offset = 1; offset <= 3; offset += 1) {
      const nextLine = normalizeSpaces(lines[index + offset] || '')
      const dateMatch = nextLine.match(DATE_PATTERN)
      if (dateMatch) {
        ngay = dateFromMatch(dateMatch)
        chucVu = normalizeSpaces(dateMatch[4] || '')
        break
      }
    }

    if (!ngay) return

    lichTruc.push({
      thu,
      ngay,
      lanhDaoTruc,
      chucVu,
      noiDung: lanhDaoTruc ? commonContent : '',
    })
  })

  return {
    metadata: {
      ...parseDateRange(text),
      capNhat: parsePublishedDate(text),
      ...parseNotes(lines),
    },
    lichTruc,
  }
}

export async function extractWorkScheduleFromPdf(filePath: string): Promise<ExtractedWorkSchedulePdf | null> {
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-'], {
      maxBuffer: 5 * 1024 * 1024,
    })
    const parsed = parseWorkSchedulePdfText(stdout)
    return parsed.lichTruc.length > 0 ? parsed : null
  } catch (err) {
    console.warn('[WorkSchedulePDF] Không thể trích xuất PDF:', err)
    return null
  }
}
