/**
 * @nhom        : Bảo mật / Chống spam
 * @chucnang    : Xác minh Cloudflare Turnstile (captcha) — chỉ bật khi đã cấu hình TURNSTILE_SECRET_KEY
 * @lienquan    : src/app/api/feedback/route.ts, src/components/ContactForm.tsx
 * @alias       : turnstile, captcha
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function getTurnstileSiteKey(): string | undefined {
  return process.env.TURNSTILE_SITE_KEY?.trim() || undefined
}

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim() && getTurnstileSiteKey())
}

/**
 * @chucnang    : Gửi token lên Cloudflare để xác minh
 * @output      : true nếu hợp lệ (hoặc Turnstile chưa bật)
 */
export async function verifyTurnstileToken(token: unknown, ip: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true
  if (typeof token !== 'string' || !token || token.length > 2048) return false

  const form = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!.trim(),
    response: token,
  })
  if (ip !== 'unknown') form.set('remoteip', ip)

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form, signal: AbortSignal.timeout(8000) })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (err) {
    // Cloudflare không phản hồi — không chặn người dân, các lớp rate limit vẫn hoạt động
    console.warn('[Turnstile] Không xác minh được, cho qua:', err)
    return true
  }
}
