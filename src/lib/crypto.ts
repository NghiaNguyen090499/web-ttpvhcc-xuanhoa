/**
 * @nhom        : Bảo mật
 * @chucnang    : Mã hóa / giải mã AES-256-GCM cho dữ liệu nhạy cảm
 * @output      : encrypt(text) → ciphertext, decrypt(ciphertext) → text
 * @lienquan    : src/lib/queries.ts, .env (ENCRYPTION_KEY)
 * @alias       : crypto, aes-256, encryption, bao-mat
 *
 * Sử dụng AES-256-GCM (authenticated encryption):
 * - Key: Dẫn xuất từ ENCRYPTION_KEY qua scrypt (32 bytes)
 * - IV: Ngẫu nhiên 16 bytes mỗi lần mã hóa
 * - Auth Tag: 16 bytes — chống giả mạo dữ liệu
 * - Định dạng output: iv:authTag:ciphertext (hex)
 *
 * Áp dụng cho: Feedback (name, email, phone)
 * Supabase đã có encryption at rest (AES-256) cho toàn bộ DB
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto'

// Thuật toán mã hóa
const ALGORITHM = 'aes-256-gcm'
// Độ dài IV (Initialization Vector) — 16 bytes
const IV_LENGTH = 16
// Salt cố định cho key derivation (dẫn xuất khóa)
const SALT = 'ttpvhcc-xuanhoa-aes256-salt-v1'

/**
 * @chucnang    : Dẫn xuất khóa 32 bytes từ ENCRYPTION_KEY
 * @output      : Buffer 32 bytes
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'ENCRYPTION_KEY chưa được cấu hình trong .env — ' +
      'Cần chuỗi bí mật ≥ 32 ký tự để mã hóa AES-256'
    )
  }
  // scrypt: hàm dẫn xuất khóa chống brute-force
  return scryptSync(secret, SALT, 32)
}

/**
 * @chucnang    : Mã hóa chuỗi văn bản bằng AES-256-GCM
 * @input       : text (string) — văn bản cần mã hóa
 * @output      : string — định dạng "iv:authTag:ciphertext" (hex)
 */
export function encrypt(text: string): string {
  const key = getKey()
  // IV ngẫu nhiên mỗi lần — đảm bảo cùng plaintext cho ra ciphertext khác nhau
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Auth tag — dùng để xác thực dữ liệu chưa bị sửa đổi
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * @chucnang    : Giải mã chuỗi đã mã hóa AES-256-GCM
 * @input       : encryptedText (string) — định dạng "iv:authTag:ciphertext"
 * @output      : string — văn bản gốc
 */
export function decrypt(encryptedText: string): string {
  const key = getKey()
  const parts = encryptedText.split(':')

  if (parts.length !== 3) {
    throw new Error('Định dạng dữ liệu mã hóa không hợp lệ')
  }

  const [ivHex, authTagHex, ciphertext] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * @chucnang    : Mã hóa có điều kiện — chỉ mã hóa nếu giá trị tồn tại
 * @input       : value (string | null | undefined)
 * @output      : string | null — ciphertext hoặc null
 */
export function encryptOptional(value: string | null | undefined): string | null {
  if (!value) return null
  return encrypt(value)
}

/**
 * @chucnang    : Giải mã có điều kiện — chỉ giải mã nếu giá trị tồn tại
 * @input       : value (string | null | undefined)
 * @output      : string | null — plaintext hoặc null
 */
export function decryptOptional(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return decrypt(value)
  } catch {
    // Nếu giá trị không phải dữ liệu đã mã hóa, trả về nguyên gốc
    return value
  }
}
