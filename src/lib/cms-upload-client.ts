'use client'

import type { LichTrucEntry } from '@/lib/static-data'

export interface CmsUploadResult {
  success: boolean
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  workSchedule?: {
    metadata: {
      tuanSo?: number
      tuanTu?: string
      tuanDen?: string
      capNhat?: string
      gioLamViec?: string[]
      diaDiemTruSo?: string[]
    }
    lichTruc: LichTrucEntry[]
  } | null
}

interface UploadCmsFileOptions {
  folder?: 'tin-tuc' | 'tuyen-truyen' | 'chuyen-doi-so' | 'lich-cong-tac' | 'niem-yet' | 'van-ban'
  allowedMimePrefixes?: string[]
  maxSize?: number
  onProgress?: (percent: number) => void
}

const MAX_UPLOAD_SIZE = 300 * 1024 * 1024
const DEFAULT_ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf']

function readUploadResponse(xhr: XMLHttpRequest) {
  try {
    return JSON.parse(xhr.responseText) as Partial<CmsUploadResult> & { error?: string }
  } catch {
    return {}
  }
}

export function validateCmsUploadFile(file: File, options: UploadCmsFileOptions = {}) {
  const maxSize = options.maxSize ?? MAX_UPLOAD_SIZE
  const allowedMimePrefixes = options.allowedMimePrefixes ?? DEFAULT_ALLOWED_MIME_PREFIXES

  if (file.size > maxSize) {
    return 'Tệp vượt quá dung lượng 300MB'
  }

  if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
    return 'Không hỗ trợ SVG'
  }

  const allowed = allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix))
  if (!allowed) {
    return 'Định dạng tệp không được hỗ trợ'
  }

  return null
}

export function uploadCmsFile(file: File, options: UploadCmsFileOptions = {}) {
  const validationError = validateCmsUploadFile(file, options)
  if (validationError) return Promise.reject(new Error(validationError))

  return new Promise<CmsUploadResult>((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', options.folder || 'tin-tuc')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/uploads')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      const data = readUploadResponse(xhr)

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data.error || `Không thể tải tệp lên (${xhr.status})`))
        return
      }

      if (!data.url || !data.fileName || typeof data.fileSize !== 'number' || !data.mimeType) {
        reject(new Error('Phản hồi upload không hợp lệ'))
        return
      }

      resolve({
        success: Boolean(data.success),
        url: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        workSchedule: data.workSchedule,
      })
    }

    xhr.onerror = () => reject(new Error('Không thể tải tệp lên'))
    xhr.send(formData)
  })
}
