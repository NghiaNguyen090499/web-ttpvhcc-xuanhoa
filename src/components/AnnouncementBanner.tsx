/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Thanh thông báo trượt — carousel 3-5 thông báo nổi bật
 *                Học từ DVC Quốc gia: dạng ticker auto-slide bên dưới hero
 * @lienquan    : src/app/(public)/page.tsx
 * @alias       : announcement, thong-bao, ticker
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* Dữ liệu thông báo — sau này lấy từ CMS/Supabase */
const ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'urgent' as const,
    title: 'Thông báo lịch tiếp nhận hồ sơ dịp Lễ 2/9',
    date: '2026-08-25',
    href: '/tin-tuc',
  },
  {
    id: 2,
    type: 'info' as const,
    title: 'Triển khai dịch vụ công trực tuyến toàn trình — 100% thủ tục đủ điều kiện',
    date: '2026-05-01',
    href: '/tin-tuc',
  },
  {
    id: 3,
    type: 'new' as const,
    title: 'Hướng dẫn đăng ký tài khoản Cổng Dịch vụ công Quốc gia cho công dân',
    date: '2026-04-20',
    href: '/tin-tuc',
  },
  {
    id: 4,
    type: 'info' as const,
    title: 'Phường Xuân Hòa triển khai Chatbot AI hỗ trợ tra cứu thủ tục 24/7',
    date: '2026-03-15',
    href: '/tin-tuc',
  },
]

/* Badge màu theo loại thông báo */
const TYPE_STYLES = {
  urgent: { bg: 'bg-danger', text: 'text-white', label: 'Khẩn' },
  info: { bg: 'bg-info', text: 'text-white', label: 'Thông báo' },
  new: { bg: 'bg-success', text: 'text-white', label: 'Mới' },
}

export function AnnouncementBanner() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = ANNOUNCEMENTS.length

  /* Tự động chuyển slide mỗi 5 giây */
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const item = ANNOUNCEMENTS[current]
  const style = TYPE_STYLES[item.type]

  return (
    <section
      className="bg-white border-b border-border relative overflow-hidden"
      id="announcement-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Thông báo quan trọng"
    >
      <div className="container-main">
        <div className="flex items-center gap-3 py-2.5 md:py-3">
          {/* Icon loa */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            <span className="hidden sm:inline text-xs font-bold text-primary uppercase tracking-wider">
              Thông báo
            </span>
          </div>

          {/* Divider dọc */}
          <div className="w-px h-6 bg-border hidden sm:block" />

          {/* Nội dung slide */}
          <div className="flex-1 min-w-0 relative h-6 overflow-hidden">
            <Link
              href={item.href}
              key={item.id}
              className="absolute inset-0 flex items-center gap-2 animate-slide-in hover:text-primary btn-transition"
            >
              {/* Badge loại */}
              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              {/* Tiêu đề */}
              <span className="text-sm text-text-primary truncate font-medium">
                {item.title}
              </span>
              {/* Ngày */}
              <span className="hidden md:inline text-xs text-text-muted shrink-0 ml-auto">
                {new Date(item.date).toLocaleDateString('vi-VN')}
              </span>
            </Link>
          </div>

          {/* Nút prev / next */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={prev}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream text-text-muted hover:text-primary btn-transition"
              aria-label="Thông báo trước"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Chỉ số trang */}
            <span className="text-[10px] text-text-muted font-mono tabular-nums min-w-[2rem] text-center">
              {current + 1}/{total}
            </span>

            <button
              onClick={next}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream text-text-muted hover:text-primary btn-transition"
              aria-label="Thông báo tiếp"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar — chạy theo timer */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full">
          <div
            className="h-full bg-primary animate-progress"
            style={{ animationDuration: '5s' }}
          />
        </div>
      )}
    </section>
  )
}
