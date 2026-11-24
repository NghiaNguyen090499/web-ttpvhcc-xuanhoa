/**
 * @nhom        : Notifications / Email
 * @chucnang    : Gửi thông báo phản ánh mới tới cán bộ + gửi phản hồi của cán bộ tới người dân qua SMTP
 * @lienquan    : src/app/api/feedback/route.ts, src/app/api/admin/feedback/route.ts
 * @alias       : feedback-email, smtp-feedback-notification
 */

import nodemailer from 'nodemailer'

export interface MailAttachment {
  filename: string
  content: Buffer
  contentType: string
}

export interface FeedbackEmailInput {
  name: string
  phone?: string
  email?: string
  subject: string
  content: string
  attachments?: MailAttachment[]
}

export type FeedbackEmailResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: 'not-configured' | 'delivery-failed' }

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASSWORD
  const recipient = process.env.FEEDBACK_NOTIFY_EMAIL?.trim()
  const fromAddress = process.env.SMTP_FROM?.trim() || user
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'TTPVHCC Phường Xuân Hòa'

  if (!host || !Number.isInteger(port) || port <= 0 || !user || !pass || !recipient || !fromAddress) {
    return null
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    user,
    pass,
    recipient,
    fromAddress,
    fromName,
  }
}

export function isFeedbackEmailConfigured(): boolean {
  return getSmtpConfig() !== null
}

function createTransporter(config: NonNullable<ReturnType<typeof getSmtpConfig>>) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
}

function formatVietnamTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date)
}

export async function sendFeedbackNotification(input: FeedbackEmailInput): Promise<FeedbackEmailResult> {
  const config = getSmtpConfig()
  if (!config) return { sent: false, reason: 'not-configured' }

  const transporter = createTransporter(config)
  const submittedAt = formatVietnamTime(new Date())

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ttpvhcc-xuanhoa-hcm.gov.vn'}/admin/phan-anh`
  const text = [
    'TTPVHCC Phường Xuân Hòa vừa nhận được một phản ánh mới.',
    '',
    `Thời gian: ${submittedAt}`,
    `Người gửi: ${input.name}`,
    `Điện thoại: ${input.phone || 'Không cung cấp'}`,
    `Email: ${input.email || 'Không cung cấp'}`,
    `Tiêu đề: ${input.subject}`,
    '',
    'Nội dung:',
    input.content,
    '',
    ...(input.attachments?.length ? [`Ảnh đính kèm: ${input.attachments.length} tệp (xem trong email này hoặc trên CMS)`, ''] : []),
    `Mở CMS để xử lý: ${adminUrl}`,
    '',
    'Email được gửi tự động từ website TTPVHCC Phường Xuân Hòa.',
  ].join('\n')

  try {
    const info = await transporter.sendMail({
      from: { name: config.fromName, address: config.fromAddress },
      to: config.recipient,
      replyTo: input.email,
      subject: '[TTPVHCC Xuân Hòa] Có phản ánh mới',
      text,
      attachments: input.attachments,
    })

    return { sent: true, messageId: info.messageId }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown SMTP error'
    console.error('[FeedbackEmail] Gửi thông báo thất bại:', details)
    return { sent: false, reason: 'delivery-failed' }
  } finally {
    transporter.close()
  }
}


export interface FeedbackResponseEmailInput {
  to: string
  name: string
  subject: string
  content: string
  response: string
  createdAt: Date | string
  attachments?: MailAttachment[]
}

/** Gửi nội dung phản hồi của cán bộ tới email người dân đã cung cấp */
export async function sendFeedbackResponse(input: FeedbackResponseEmailInput): Promise<FeedbackEmailResult> {
  const config = getSmtpConfig()
  if (!config) return { sent: false, reason: 'not-configured' }

  const transporter = createTransporter(config)
  const text = [
    `Kính gửi ông/bà ${input.name},`,
    '',
    `Trung tâm Phục vụ Hành chính công Phường Xuân Hòa đã tiếp nhận phản ánh "${input.subject}" gửi lúc ${formatVietnamTime(new Date(input.createdAt))} và xin phản hồi như sau:`,
    '',
    input.response,
    '',
    ...(input.attachments?.length
      ? [`Tài liệu đính kèm (${input.attachments.length} tệp):`, ...input.attachments.map((file) => `- ${file.filename}`), '']
      : []),
    '---',
    'Nội dung phản ánh của ông/bà:',
    input.content,
    '---',
    '',
    'Trân trọng,',
    config.fromName,
  ].join('\n')

  try {
    const info = await transporter.sendMail({
      from: { name: config.fromName, address: config.fromAddress },
      to: input.to,
      replyTo: config.recipient,
      subject: `[TTPVHCC Xuân Hòa] Phản hồi: ${input.subject}`,
      text,
      attachments: input.attachments,
    })

    return { sent: true, messageId: info.messageId }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown SMTP error'
    console.error('[FeedbackEmail] Gửi phản hồi tới người dân thất bại:', details)
    return { sent: false, reason: 'delivery-failed' }
  } finally {
    transporter.close()
  }
}
