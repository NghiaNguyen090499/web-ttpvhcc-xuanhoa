'use client'

/**
 * @nhom        : Admin / Pages
 * @chucnang    : Trang đăng nhập admin — Google OAuth + Dev login
 * @lienquan    : src/app/api/auth/login/route.ts, src/lib/auth.ts
 * @alias       : admin-login, dang-nhap-admin
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

// Mapping lỗi OAuth
const ERROR_MESSAGES: Record<string, string> = {
  no_code: 'Không nhận được mã xác thực từ Google.',
  google_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  not_allowed: 'Email của bạn không có quyền truy cập Admin.',
  server_error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const from = searchParams.get('from') || '/admin'

  // State cho dev login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam ? ERROR_MESSAGES[errorParam] || 'Có lỗi xảy ra' : '')

  // URL đăng nhập Google OAuth
  const googleOAuthUrl = `/api/auth/google?from=${encodeURIComponent(from)}`

  /**
   * @chucnang    : Xử lý đăng nhập dev mode
   */
  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/auth/login?from=${encodeURIComponent(from)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại')
        setLoading(false)
        return
      }

      router.push(data.redirect || '/admin')
    } catch {
      setError('Không thể kết nối đến máy chủ')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo + Tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Image
              src="/images/logo.png"
              alt="Logo TTPVHCC"
              width={48}
              height={48}
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading uppercase tracking-wide">
            Quản trị hệ thống
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            TTPVHCC Phường Xuân Hòa
          </p>
        </div>

        {/* Card đăng nhập */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Nút Google OAuth */}
          <a
            href={googleOAuthUrl}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập với Google
          </a>

          {/* Đường phân cách */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-gray-500">hoặc đăng nhập Dev</span>
            </div>
          </div>

          {/* Form dev login */}
          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@xuanhoa.gov.vn"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Ghi chú dev */}
          <p className="mt-4 text-center text-[10px] text-gray-500 leading-relaxed">
            Dev mode: admin@xuanhoa.gov.vn / admin123
          </p>
        </div>

        {/* Link về trang chủ */}
        <p className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Về trang chủ
          </a>
        </p>
      </div>
    </div>
  )
}
