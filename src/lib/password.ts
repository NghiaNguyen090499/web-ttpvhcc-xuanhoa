/**
 * @nhom        : Bảo mật / Auth
 * @chucnang    : Hash và kiểm tra mật khẩu nội bộ CMS bằng scrypt
 * @lienquan    : src/app/api/auth/login/route.ts, src/app/api/admin/users/route.ts
 * @alias       : password-hash
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [scheme, salt, hash] = storedHash.split(':')
  if (scheme !== 'scrypt' || !salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, expected.length)

  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export const MIN_PASSWORD_LENGTH = 12

/** Tối thiểu 12 ký tự, có chữ và số */
export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && /[A-Za-zÀ-ỹ]/.test(password) && /\d/.test(password)
}

export const PASSWORD_POLICY_MESSAGE = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự, gồm cả chữ và số`
