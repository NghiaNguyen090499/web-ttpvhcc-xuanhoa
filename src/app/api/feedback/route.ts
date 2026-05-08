/**
 * @nhom        : API Routes / Feedback
 * @chucnang    : POST /api/feedback — nhận phản ánh từ người dân
 * @input       : { name, phone?, email?, subject, message } (JSON body)
 * @output      : { success: true, message } hoặc { error }
 * @lienquan    : src/lib/crypto.ts, src/lib/queries.ts, src/components/ContactForm.tsx
 * @alias       : feedback-api, phan-anh-api
 */

import { NextRequest, NextResponse } from 'next/server'

// Regex kiểm tra định dạng
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\s\-+()]{8,15}$/

/**
 * @chucnang    : Xử lý POST — nhận phản ánh, validate, mã hóa, lưu
 * @input       : request (NextRequest) — body JSON
 * @output      : NextResponse — JSON kết quả
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // --- Validate trường bắt buộc ---
    const name = body.name?.trim()
    const subject = body.subject?.trim()
    const message = body.message?.trim()

    if (!name || !subject || !message) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ họ tên, tiêu đề và nội dung' },
        { status: 400 }
      )
    }

    // --- Validate định dạng (nếu có) ---
    const email = body.email?.trim() || undefined
    const phone = body.phone?.trim() || undefined

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Email không đúng định dạng' },
        { status: 400 }
      )
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ (8-15 ký tự số)' },
        { status: 400 }
      )
    }

    // --- Giới hạn độ dài ---
    const sanitized = {
      name: name.slice(0, 100),
      phone: phone?.slice(0, 20),
      email: email?.slice(0, 100),
      subject: subject.slice(0, 200),
      content: message.slice(0, 5000),
    }

    // --- Thử lưu vào DB (mã hóa PII bằng AES-256) ---
    let savedToDb = false
    try {
      const { encrypt, encryptOptional } = await import('@/lib/crypto')
      const { createFeedback } = await import('@/lib/queries')

      await createFeedback({
        name: encrypt(sanitized.name),
        phone: encryptOptional(sanitized.phone) ?? undefined,
        email: encryptOptional(sanitized.email) ?? undefined,
        subject: sanitized.subject,
        content: sanitized.content,
      })
      savedToDb = true
    } catch (dbError) {
      // DB chưa kết nối — ghi log fallback
      console.warn('[Feedback] DB chưa kết nối, ghi log fallback:', dbError)
      console.log('[Feedback] Phản ánh mới:', {
        subject: sanitized.subject,
        hasName: !!sanitized.name,
        hasEmail: !!sanitized.email,
        hasPhone: !!sanitized.phone,
        contentLength: sanitized.content.length,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Phản ánh đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.',
      savedToDb,
    })
  } catch (err) {
    console.error('[Feedback] Lỗi xử lý:', err)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại sau' },
      { status: 500 }
    )
  }
}
