/**
 * @nhom        : API Routes / Feedback
 * @chucnang    : POST /api/feedback — nhận phản ánh từ người dân
 * @input       : { name, phone, email?, subject, message } (JSON hoặc multipart/form-data kèm attachments[] — ảnh)
 * @output      : { success: true, message } hoặc { error }
 * @lienquan    : src/lib/crypto.ts, src/lib/queries.ts, src/components/ContactForm.tsx
 * @alias       : feedback-api, phan-anh-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { isFeedbackEmailConfigured, sendFeedbackNotification } from '@/lib/feedback-email'
import { getClientIp } from '@/lib/login-rate-limit'
import {
  consumeFormQuota,
  countLinks,
  isDuplicateSubmission,
  isSubmittedTooFast,
} from '@/lib/form-rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import {
  AttachmentError,
  prepareAttachments,
  removeAttachments,
  storeAttachments,
  toMailAttachments,
  type FeedbackAttachment,
  type PreparedAttachment,
} from '@/lib/feedback-attachments'

export const runtime = 'nodejs'

// Regex kiểm tra định dạng
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\s\-+()]{8,15}$/

// Chống spam: 3 phản ánh/10 phút, 10 phản ánh/ngày cho mỗi IP
const FEEDBACK_RATE_RULES = [
  { max: 3, windowMs: 10 * 60 * 1000 },
  { max: 10, windowMs: 24 * 60 * 60 * 1000 },
]
const MAX_LINKS = 3

type FeedbackBody = Record<string, string | undefined>

/** Đọc body JSON hoặc multipart (khi có ảnh đính kèm) */
async function readBody(request: NextRequest): Promise<{ body: FeedbackBody; files: FormDataEntryValue[] }> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const body: FeedbackBody = {}
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') body[key] = value
    }
    return { body, files: formData.getAll('attachments') }
  }
  const json = await request.json()
  const body: FeedbackBody = {}
  if (json && typeof json === 'object') {
    for (const [key, value] of Object.entries(json)) {
      if (typeof value === 'string' || typeof value === 'number') body[key] = String(value)
    }
  }
  return { body, files: [] }
}

/**
 * @chucnang    : Xử lý POST — nhận phản ánh, validate, mã hóa, lưu
 * @input       : request (NextRequest) — body JSON
 * @output      : NextResponse — JSON kết quả
 */
export async function POST(request: NextRequest) {
  try {
    const { body, files } = await readBody(request)

    // --- Honeypot / gửi quá nhanh: giả vờ thành công để bot không dò ra ---
    if (String(body.website || '').trim() || isSubmittedTooFast(body.startedAt)) {
      return NextResponse.json({ success: true, message: 'Phản ánh đã được gửi thành công.' })
    }

    // --- Giới hạn tần suất theo IP ---
    const ip = getClientIp(request.headers)
    const retryAfter = consumeFormQuota('feedback', ip, FEEDBACK_RATE_RULES)
    if (retryAfter > 0) {
      return NextResponse.json(
        { error: `Bạn đã gửi quá nhiều phản ánh. Vui lòng thử lại sau ${Math.ceil(retryAfter / 60)} phút.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // --- Captcha (chỉ khi đã cấu hình Turnstile) ---
    if (!(await verifyTurnstileToken(body.turnstileToken, ip))) {
      return NextResponse.json(
        { error: 'Xác minh chống spam không thành công, vui lòng thử lại' },
        { status: 400 }
      )
    }

    // --- Validate trường bắt buộc ---
    const name = body.name?.trim()
    const subject = body.subject?.trim()
    const message = body.message?.trim()

    const phone = body.phone?.trim() || undefined

    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ họ tên, số điện thoại, tiêu đề và nội dung' },
        { status: 400 }
      )
    }

    // --- Validate định dạng (nếu có) ---
    const email = body.email?.trim() || undefined

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Email không đúng định dạng' },
        { status: 400 }
      )
    }

    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ (8-15 ký tự số)' },
        { status: 400 }
      )
    }

    // --- Giới hạn độ dài ---
    const sanitized = {
      name: name.slice(0, 100),
      phone: phone.slice(0, 20),
      email: email?.slice(0, 100),
      subject: subject.slice(0, 200),
      content: message.slice(0, 5000),
    }

    if (countLinks(`${sanitized.subject} ${sanitized.content}`) > MAX_LINKS) {
      return NextResponse.json(
        { error: 'Nội dung chứa quá nhiều đường link' },
        { status: 400 }
      )
    }

    if (isDuplicateSubmission('feedback', `${sanitized.subject}\n${sanitized.content}`, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Phản ánh với nội dung này đã được gửi trước đó' },
        { status: 409 }
      )
    }

    // --- Kiểm tra ảnh đính kèm (định dạng, dung lượng, magic bytes) ---
    let prepared: PreparedAttachment[] = []
    try {
      prepared = await prepareAttachments(files, 'citizen')
    } catch (err) {
      if (err instanceof AttachmentError) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      throw err
    }

    // --- Thử lưu vào DB (mã hóa PII bằng AES-256) ---
    let savedToDb = false
    let stored: FeedbackAttachment[] = []
    try {
      stored = await storeAttachments(prepared, 'citizen')
      const { encrypt, encryptOptional } = await import('@/lib/crypto')
      const { createFeedback } = await import('@/lib/queries')

      await createFeedback({
        name: encrypt(sanitized.name),
        phone: encryptOptional(sanitized.phone) ?? undefined,
        email: encryptOptional(sanitized.email) ?? undefined,
        subject: sanitized.subject,
        content: sanitized.content,
        attachments: stored.length > 0 ? stored : undefined,
      })
      savedToDb = true
    } catch (dbError) {
      // Không có bản ghi tham chiếu → xóa tệp đã ghi
      await removeAttachments(stored, 'citizen')
      // DB chưa kết nối — ghi log fallback
      console.warn('[Feedback] DB chưa kết nối, ghi log fallback:', dbError)
      console.log('[Feedback] Phản ánh mới:', {
        subject: sanitized.subject,
        hasName: !!sanitized.name,
        hasEmail: !!sanitized.email,
        hasPhone: !!sanitized.phone,
        contentLength: sanitized.content.length,
        attachments: prepared.length,
        timestamp: new Date().toISOString(),
      })
    }

    // --- Gửi bản sao tới email cán bộ sau khi đã lưu phản ánh ---
    const emailConfigured = isFeedbackEmailConfigured()
    const emailNotification = await sendFeedbackNotification({
      ...sanitized,
      attachments: toMailAttachments(prepared),
    })

    if (emailConfigured && !emailNotification.sent) {
      console.warn('[Feedback] Phản ánh đã được lưu nhưng chưa gửi được email thông báo')
    }

    return NextResponse.json({
      success: true,
      message: 'Phản ánh đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.',
      savedToDb,
      emailNotificationSent: emailNotification.sent,
    })
  } catch (err) {
    console.error('[Feedback] Lỗi xử lý:', err)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại sau' },
      { status: 500 }
    )
  }
}
