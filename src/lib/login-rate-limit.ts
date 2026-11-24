/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Giới hạn đăng nhập sai — chống dò mật khẩu (in-memory, 1 instance app)
 * @lienquan    : src/app/api/auth/login/route.ts
 * @alias       : login-rate-limit, brute-force
 *
 * Khóa theo email (5 lần sai/15 phút) và theo IP (20 lần — ngưỡng cao vì cơ quan dùng chung IP NAT).
 */

const MAX_FAILURES_EMAIL = 5
const MAX_FAILURES_IP = 20
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000

interface Entry {
  failures: number
  firstFailureAt: number
  lockedUntil: number
}

const entries = new Map<string, Entry>()

function keysFor(ip: string, email: string) {
  return [`ip:${ip}`, `email:${email}`]
}

function prune(now: number) {
  if (entries.size < 5000) return
  for (const [key, entry] of entries) {
    if (entry.lockedUntil < now && now - entry.firstFailureAt > WINDOW_MS) entries.delete(key)
  }
}

/** Số giây còn bị khóa (0 nếu được phép thử) */
export function getLockRemainingSeconds(ip: string, email: string): number {
  const now = Date.now()
  const remaining = Math.max(
    0,
    ...keysFor(ip, email).map((key) => (entries.get(key)?.lockedUntil ?? 0) - now)
  )
  return Math.ceil(remaining / 1000)
}

export function recordLoginFailure(ip: string, email: string) {
  const now = Date.now()
  prune(now)
  for (const key of keysFor(ip, email)) {
    const entry = entries.get(key)
    if (!entry || now - entry.firstFailureAt > WINDOW_MS) {
      entries.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 })
      continue
    }
    entry.failures += 1
    const max = key.startsWith('ip:') ? MAX_FAILURES_IP : MAX_FAILURES_EMAIL
    if (entry.failures >= max) entry.lockedUntil = now + LOCK_MS
  }
}

export function clearLoginFailures(email: string) {
  // Chỉ xóa theo email — IP có thể dùng chung (NAT cơ quan), không mở khóa thay người khác
  entries.delete(`email:${email}`)
}

export function getClientIp(headers: Headers): string {
  return headers.get('x-real-ip')
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}
