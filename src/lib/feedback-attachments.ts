/**
 * @nhom        : Feedback / Attachments
 * @chucnang    : Kiểm tra, lưu và đọc tệp đính kèm của phản ánh (ảnh người dân gửi + tệp cán bộ trả lời)
 * @lienquan    : src/app/api/feedback/route.ts, src/app/api/admin/feedback/route.ts,
 *                src/app/api/admin/feedback/attachments/[kind]/[file]/route.ts
 * @alias       : feedback-attachments, dinh-kem-phan-anh
 *
 * Tệp được lưu trong thư mục riêng tư `${UPLOAD_DIR}/_private/phan-anh/<kind>/` với tên ngẫu nhiên (UUID).
 * Route công khai /uploads/* chặn mọi đường dẫn bắt đầu bằng "_" nên tệp KHÔNG truy cập công khai được —
 * chỉ cán bộ đã đăng nhập xem qua /api/admin/feedback/attachments/*.
 */

import { randomUUID } from 'crypto'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { extname, join } from 'path'

const DEFAULT_UPLOAD_DIR = '/tmp/xuanhoa-uploads'

export type AttachmentKind = 'citizen' | 'response'

// Dùng `type` (không phải interface) để tương thích kiểu Json của Prisma
export type FeedbackAttachment = {
  /** Tên tệp lưu trên đĩa: <uuid>.<ext> */
  id: string
  /** Tên tệp gốc (đã làm sạch) để hiển thị / gửi email */
  name: string
  size: number
  mimeType: string
}

export type PreparedAttachment = FeedbackAttachment & {
  buffer: Buffer
}

type Signature = (buf: Buffer) => boolean

const isJpeg: Signature = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
const isPng: Signature = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
const isWebp: Signature = (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'
const isPdf: Signature = (b) => b.length > 5 && b.toString('ascii', 0, 5) === '%PDF-'
const isZip: Signature = (b) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04
const isOle: Signature = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))

const FILE_TYPES: Record<string, { mimeType: string; check: Signature; image: boolean }> = {
  '.jpg': { mimeType: 'image/jpeg', check: isJpeg, image: true },
  '.jpeg': { mimeType: 'image/jpeg', check: isJpeg, image: true },
  '.png': { mimeType: 'image/png', check: isPng, image: true },
  '.webp': { mimeType: 'image/webp', check: isWebp, image: true },
  '.pdf': { mimeType: 'application/pdf', check: isPdf, image: false },
  '.doc': { mimeType: 'application/msword', check: isOle, image: false },
  '.docx': { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', check: isZip, image: false },
  '.xls': { mimeType: 'application/vnd.ms-excel', check: isOle, image: false },
  '.xlsx': { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', check: isZip, image: false },
}

export const ATTACHMENT_RULES: Record<AttachmentKind, {
  extensions: string[]
  maxFiles: number
  maxFileSize: number
  maxTotalSize: number
  label: string
}> = {
  // Người dân: chỉ ảnh
  citizen: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024,
    maxTotalSize: 20 * 1024 * 1024,
    label: 'ảnh JPG, PNG hoặc WEBP',
  },
  // Cán bộ trả lời: ảnh + văn bản (gửi kèm email nên giới hạn tổng 20MB)
  response: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024,
    maxTotalSize: 20 * 1024 * 1024,
    label: 'ảnh, PDF, Word hoặc Excel',
  },
}

const STORED_NAME_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|pdf|doc|docx|xls|xlsx)$/

export class AttachmentError extends Error {}

function getAttachmentDir(kind: AttachmentKind) {
  return join(process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR, '_private', 'phan-anh', kind)
}

function formatMb(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)}MB`
}

/** Làm sạch tên tệp gốc: bỏ ký tự điều khiển / đường dẫn, giới hạn độ dài */
function cleanOriginalName(name: string, extension: string) {
  const base = name
    .slice(0, name.length - extname(name).length)
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return `${base || 'tep-dinh-kem'}${extension}`
}

/**
 * @chucnang    : Kiểm tra danh sách tệp (số lượng, dung lượng, định dạng, magic bytes) và đọc vào bộ nhớ
 * @output      : PreparedAttachment[] — chưa ghi đĩa
 */
export async function prepareAttachments(entries: FormDataEntryValue[], kind: AttachmentKind): Promise<PreparedAttachment[]> {
  const rules = ATTACHMENT_RULES[kind]
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (files.length > rules.maxFiles) {
    throw new AttachmentError(`Chỉ được đính kèm tối đa ${rules.maxFiles} tệp`)
  }

  let total = 0
  const prepared: PreparedAttachment[] = []

  for (const file of files) {
    const extension = extname(file.name).toLowerCase()
    const type = FILE_TYPES[extension]
    if (!type || !rules.extensions.includes(extension)) {
      throw new AttachmentError(`Tệp "${file.name}" không đúng định dạng (chỉ hỗ trợ ${rules.label})`)
    }
    if (file.size > rules.maxFileSize) {
      throw new AttachmentError(`Tệp "${file.name}" vượt quá ${formatMb(rules.maxFileSize)}`)
    }
    total += file.size
    if (total > rules.maxTotalSize) {
      throw new AttachmentError(`Tổng dung lượng tệp đính kèm vượt quá ${formatMb(rules.maxTotalSize)}`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!type.check(buffer)) {
      throw new AttachmentError(`Tệp "${file.name}" bị lỗi hoặc không đúng định dạng`)
    }

    prepared.push({
      id: `${randomUUID()}${extension}`,
      name: cleanOriginalName(file.name, extension),
      size: buffer.length,
      mimeType: type.mimeType,
      buffer,
    })
  }

  return prepared
}

/** Ghi các tệp đã kiểm tra xuống đĩa, trả về metadata để lưu DB */
export async function storeAttachments(prepared: PreparedAttachment[], kind: AttachmentKind): Promise<FeedbackAttachment[]> {
  if (prepared.length === 0) return []
  const dir = getAttachmentDir(kind)
  await mkdir(dir, { recursive: true })

  const written: string[] = []
  try {
    for (const item of prepared) {
      const filePath = join(dir, item.id)
      await writeFile(filePath, item.buffer, { flag: 'wx', mode: 0o640 })
      written.push(filePath)
    }
  } catch (err) {
    await Promise.all(written.map((filePath) => rm(filePath, { force: true })))
    throw err
  }

  return prepared.map(({ id, name, size, mimeType }) => ({ id, name, size, mimeType }))
}

/** Xóa tệp (dùng khi lưu DB thất bại) */
export async function removeAttachments(items: FeedbackAttachment[], kind: AttachmentKind) {
  const dir = getAttachmentDir(kind)
  await Promise.all(items.map((item) => (
    STORED_NAME_REGEX.test(item.id) ? rm(join(dir, item.id), { force: true }) : Promise.resolve()
  )))
}

/** Đọc metadata tệp đính kèm từ cột JSON một cách an toàn */
export function parseAttachments(value: unknown): FeedbackAttachment[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const { id, name, size, mimeType } = item as Record<string, unknown>
    if (typeof id !== 'string' || !STORED_NAME_REGEX.test(id)) return []
    return [{
      id,
      name: typeof name === 'string' ? name : id,
      size: typeof size === 'number' ? size : 0,
      mimeType: typeof mimeType === 'string' ? mimeType : 'application/octet-stream',
    }]
  })
}

/** Thêm URL xem tệp (chỉ cán bộ đăng nhập truy cập được) */
export function withAttachmentUrls(items: FeedbackAttachment[], kind: AttachmentKind) {
  return items.map((item) => ({ ...item, url: `/api/admin/feedback/attachments/${kind}/${item.id}` }))
}

/** Đọc tệp đã lưu — trả null nếu tên không hợp lệ hoặc không tồn tại */
export async function readStoredAttachment(kind: string, fileName: string) {
  if ((kind !== 'citizen' && kind !== 'response') || !STORED_NAME_REGEX.test(fileName)) return null
  const extension = extname(fileName).toLowerCase()
  const type = FILE_TYPES[extension]
  try {
    const buffer = await readFile(join(getAttachmentDir(kind), fileName))
    return { buffer, mimeType: type.mimeType, inline: type.image || extension === '.pdf' }
  } catch {
    return null
  }
}

/** Chuyển sang định dạng attachments của nodemailer */
export function toMailAttachments(prepared: PreparedAttachment[]) {
  return prepared.map((item) => ({ filename: item.name, content: item.buffer, contentType: item.mimeType }))
}
