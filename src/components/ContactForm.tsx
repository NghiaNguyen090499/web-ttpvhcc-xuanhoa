'use client'

/**
 * @nhom        : Components / Form
 * @chucnang    : Form phản ánh kiến nghị — gửi đến API /api/feedback
 * @lienquan    : src/app/api/feedback/route.ts, src/app/(public)/lien-he/page.tsx
 * @alias       : contact-form, phan-anh, feedback-form
 */

import { useEffect, useRef, useState } from 'react'

// Trạng thái form
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// Ảnh đính kèm — khớp với ATTACHMENT_RULES.citizen ở src/lib/feedback-attachments.ts
const MAX_ATTACHMENTS = 5
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i

interface PickedImage {
  file: File
  preview: string
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * @chucnang    : Nạp script Turnstile một lần cho cả trang
 */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = TURNSTILE_SCRIPT
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject()))
    script.addEventListener('error', () => reject())
  })
}

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    website: '', // honeypot — người dùng thật không thấy trường này
  })
  const [images, setImages] = useState<PickedImage[]>([])
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<PickedImage[]>([])
  useEffect(() => {
    imagesRef.current = images
  }, [images])
  // Giải phóng URL xem trước khi rời trang
  useEffect(() => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview)), [])

  const addImages = (fileList: FileList | null) => {
    if (!fileList) return
    setImageError('')
    const next = [...images]
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_ATTACHMENTS) {
        setImageError(`Chỉ được đính kèm tối đa ${MAX_ATTACHMENTS} ảnh`)
        break
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || !ACCEPTED_IMAGE_EXT.test(file.name)) {
        setImageError(`"${file.name}" không phải ảnh JPG, PNG hoặc WEBP`)
        continue
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setImageError(`"${file.name}" vượt quá 5MB`)
        continue
      }
      next.push({ file, preview: URL.createObjectURL(file) })
    }
    setImages(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((items) => {
      URL.revokeObjectURL(items[index].preview)
      return items.filter((_, i) => i !== index)
    })
    setImageError('')
  }

  const clearImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setImageError('')
  }

  const startedAtRef = useRef(0)
  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  // Captcha Turnstile — chỉ hiện khi server đã cấu hình khóa
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return
    const container = turnstileRef.current
    let cancelled = false

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return
        widgetIdRef.current = turnstile.render(container, {
          sitekey: turnstileSiteKey,
          language: 'vi',
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        })
      })
      .catch(() => console.warn('[ContactForm] Không tải được Turnstile'))

    return () => {
      cancelled = true
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [turnstileSiteKey])

  const resetTurnstile = () => {
    setTurnstileToken('')
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
  }
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  /**
   * @chucnang    : Gửi form phản ánh đến API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (turnstileSiteKey && !turnstileToken) {
      setStatus('error')
      setErrorMsg('Vui lòng hoàn tất bước xác minh chống spam')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const payload = new FormData()
      for (const [key, value] of Object.entries(formData)) payload.append(key, value)
      payload.append('startedAt', String(startedAtRef.current))
      payload.append('turnstileToken', turnstileToken)
      images.forEach((img) => payload.append('attachments', img.file, img.file.name))

      const res = await fetch('/api/feedback', { method: 'POST', body: payload })

      const data = await res.json()
      resetTurnstile()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Có lỗi xảy ra')
        return
      }

      // Thành công — reset form
      setStatus('success')
      setFormData({ name: '', phone: '', email: '', subject: '', message: '', website: '' })
      clearImages()
      startedAtRef.current = Date.now()

      // Tự ẩn thông báo sau 6 giây
      setTimeout(() => setStatus('idle'), 6000)
    } catch {
      setStatus('error')
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại.')
    }
  }

  // Class chung cho input
  const inputClass =
    'mt-1 w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted disabled:opacity-50'

  const isLoading = status === 'loading'

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
      {/* Thông báo thành công */}
      {status === 'success' && (
        <div className="flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm font-semibold text-success animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Đã gửi phản ánh thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
        </div>
      )}

      {/* Thông báo lỗi */}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl bg-danger/10 p-4 text-sm font-semibold text-danger animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Họ và tên */}
      <div>
        <label className="text-xs font-semibold text-text-secondary">Họ và tên *</label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          placeholder="Nguyễn Văn A"
          maxLength={100}
        />
      </div>

      {/* SĐT + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-text-secondary">Số điện thoại *</label>
          <input
            type="tel"
            required
            disabled={isLoading}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={inputClass}
            placeholder="0901 234 567"
            maxLength={20}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary">Email</label>
          <input
            type="email"
            disabled={isLoading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            placeholder="email@example.com"
            maxLength={100}
          />
        </div>
      </div>

      {/* Tiêu đề */}
      <div>
        <label className="text-xs font-semibold text-text-secondary">Tiêu đề *</label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={inputClass}
          placeholder="Nội dung phản ánh..."
          maxLength={200}
        />
      </div>

      {/* Nội dung */}
      <div>
        <label className="text-xs font-semibold text-text-secondary">Nội dung chi tiết *</label>
        <textarea
          required
          rows={5}
          disabled={isLoading}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Mô tả chi tiết nội dung phản ánh, kiến nghị..."
          maxLength={5000}
        />
        <p className="mt-1 text-right text-sm text-text-muted">
          {formData.message.length}/5000
        </p>
      </div>

      {/* Ảnh đính kèm */}
      <div>
        <label htmlFor="feedback-images" className="text-xs font-semibold text-text-secondary">
          Hình ảnh đính kèm <span className="font-normal text-text-muted">(không bắt buộc)</span>
        </label>
        <input
          ref={fileInputRef}
          id="feedback-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isLoading || images.length >= MAX_ATTACHMENTS}
          onChange={(e) => addImages(e.target.files)}
          className="sr-only"
        />
        <div className="mt-1 flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div key={img.preview} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước dạng blob: */}
              <img src={img.preview} alt={img.file.name} className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[10px] text-white">
                {formatSize(img.file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={isLoading}
                aria-label={`Bỏ ảnh ${img.file.name}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-danger disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {images.length < MAX_ATTACHMENTS && (
            <label
              htmlFor="feedback-images"
              className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary hover:text-primary ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] font-semibold">Thêm ảnh</span>
            </label>
          )}
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          Tối đa {MAX_ATTACHMENTS} ảnh JPG, PNG, WEBP · mỗi ảnh không quá 5MB
        </p>
        {imageError && <p className="mt-1 text-xs font-semibold text-danger" role="alert">{imageError}</p>}
      </div>

      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {turnstileSiteKey && <div ref={turnstileRef} className="min-h-[65px]" />}

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-dark btn-transition disabled:opacity-50 disabled:cursor-not-allowed"
        id="btn-gui-phan-anh"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang gửi...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Gửi phản ánh
          </>
        )}
      </button>
    </form>
  )
}
