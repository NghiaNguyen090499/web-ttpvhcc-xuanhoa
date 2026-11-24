/**
 * @nhom        : Bảo mật / Chống spam
 * @chucnang    : Giới hạn số lần gửi form công khai theo IP + chặn nội dung trùng lặp (in-memory, 1 instance app)
 * @lienquan    : src/app/api/feedback/route.ts, src/app/api/articles/[articleId]/comments/route.ts
 * @alias       : form-rate-limit, anti-spam
 *
 * Ngưỡng nới rộng vì người dân có thể dùng chung IP (NAT nhà mạng, wifi công cộng).
 */

import { createHash } from 'crypto'

export interface RateRule {
  max: number
  windowMs: number
}

const hits = new Map<string, number[]>()
const fingerprints = new Map<string, number>()

function prune(now: number) {
  if (hits.size >= 5000) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time > 24 * 60 * 60 * 1000)) hits.delete(key)
    }
  }
  if (fingerprints.size >= 5000) {
    for (const [key, expiresAt] of fingerprints) {
      if (expiresAt < now) fingerprints.delete(key)
    }
  }
}

/**
 * @chucnang    : Ghi nhận 1 lần gửi và kiểm tra vượt ngưỡng
 * @output      : số giây phải chờ (0 = được phép)
 */
export function consumeFormQuota(scope: string, ip: string, rules: RateRule[]): number {
  const now = Date.now()
  prune(now)
  const key = `${scope}:${ip}`
  const longest = Math.max(...rules.map((rule) => rule.windowMs))
  const times = (hits.get(key) ?? []).filter((time) => now - time < longest)

  for (const rule of rules) {
    const inWindow = times.filter((time) => now - time < rule.windowMs)
    if (inWindow.length >= rule.max) {
      hits.set(key, times)
      return Math.ceil((inWindow[0] + rule.windowMs - now) / 1000)
    }
  }

  times.push(now)
  hits.set(key, times)
  return 0
}

/**
 * @chucnang    : Kiểm tra nội dung đã được gửi trong khoảng ttlMs gần đây (spam lặp lại, kể cả đổi IP)
 * @output      : true nếu trùng lặp
 */
export function isDuplicateSubmission(scope: string, content: string, ttlMs: number): boolean {
  const now = Date.now()
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim()
  const key = `${scope}:${createHash('sha256').update(normalized).digest('hex')}`
  const expiresAt = fingerprints.get(key)
  if (expiresAt && expiresAt > now) return true
  fingerprints.set(key, now + ttlMs)
  return false
}

/** Đếm số đường link trong nội dung — spam quảng cáo thường chèn nhiều link */
export function countLinks(value: string): number {
  return value.match(/(https?:\/\/|www\.)\S+/gi)?.length ?? 0
}

/** Form gửi quá nhanh sau khi tải (bot tự điền). startedAt do client gửi lên — chỉ là lớp lọc phụ */
export function isSubmittedTooFast(startedAt: unknown, minMs = 3000): boolean {
  const started = Number(startedAt)
  if (!Number.isFinite(started) || started <= 0) return false
  return Date.now() - started < minMs
}
