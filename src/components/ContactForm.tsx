'use client'

/**
 * @nhom        : Components / Form
 * @chucnang    : Form phản ánh kiến nghị — gửi đến API /api/feedback
 * @lienquan    : src/app/api/feedback/route.ts, src/app/(public)/lien-he/page.tsx
 * @alias       : contact-form, phan-anh, feedback-form
 */

import { useState } from 'react'

// Trạng thái form
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  /**
   * @chucnang    : Gửi form phản ánh đến API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Có lỗi xảy ra')
        return
      }

      // Thành công — reset form
      setStatus('success')
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' })

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
          <label className="text-xs font-semibold text-text-secondary">Số điện thoại</label>
          <input
            type="tel"
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
        <p className="mt-1 text-right text-[10px] text-text-muted">
          {formData.message.length}/5000
        </p>
      </div>

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
