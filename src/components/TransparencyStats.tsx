/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Thống kê minh bạch — dashboard mini hiển thị số liệu hồ sơ
 *                Học từ TTPVHCC Hà Nội: bảng số liệu Tiếp nhận / Đang xử lý / Đã trả / Đúng hạn
 *                Sử dụng IntersectionObserver + animate count-up khi scroll vào view
 * @lienquan    : src/app/(public)/page.tsx (thay thế StatsStrip cũ)
 * @alias       : transparency-stats, thong-ke-minh-bach, stats
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* Dữ liệu thống kê — sau này lấy từ Supabase / CMS Admin */
const STATS_DATA = {
  period: 'Tháng 5/2026',
  items: [
    {
      value: 1247,
      label: 'Hồ sơ tiếp nhận',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: '#2980B9',
      bgColor: 'rgba(41, 128, 185, 0.1)',
    },
    {
      value: 89,
      label: 'Đang xử lý',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#F39C12',
      bgColor: 'rgba(243, 156, 18, 0.1)',
    },
    {
      value: 1158,
      label: 'Đã trả kết quả',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#1a7a3a',
      bgColor: 'rgba(26, 122, 58, 0.1)',
    },
    {
      value: 98.5,
      suffix: '%',
      label: 'Tỷ lệ đúng hạn',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: '#a61d21',
      bgColor: 'rgba(166, 29, 33, 0.1)',
    },
  ],
}

/**
 * @chucnang    : Hook count-up animation — đếm từ 0 đến target value
 * @input       : end (số đích), duration (ms), isActive (boolean bật/tắt)
 * @output      : số hiện tại đang đếm
 */
function useCountUp(end: number, duration = 2000, isActive = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    let startTime: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      /* Easing — ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * end)

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [end, duration, isActive])

  return count
}

/**
 * @chucnang    : Card thống kê 1 chỉ số — animate count-up
 * @input       : item (dữ liệu), isVisible (boolean)
 * @output      : JSX card
 */
function StatCard({
  item,
  isVisible,
  index,
}: {
  item: (typeof STATS_DATA.items)[0]
  isVisible: boolean
  index: number
}) {
  const count = useCountUp(item.value, 2000, isVisible)
  const suffix = (item as { suffix?: string }).suffix || ''

  /* Format số — nếu là % giữ 1 decimal, ngược lại là integer */
  const formatted = suffix === '%'
    ? count.toFixed(1)
    : Math.round(count).toLocaleString('vi-VN')

  return (
    <div
      className="group flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-white border border-border hover:shadow-lg hover:-translate-y-1 btn-transition"
      style={{
        animationDelay: `${index * 0.1}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-3 group-hover:scale-110 btn-transition"
        style={{ backgroundColor: item.bgColor, color: item.color }}
      >
        {item.icon}
      </div>

      {/* Số */}
      <p
        className="text-3xl md:text-4xl font-bold font-heading tabular-nums"
        style={{ color: item.color }}
      >
        {formatted}
        {suffix && <span className="text-xl">{suffix}</span>}
      </p>

      {/* Label */}
      <p className="mt-1.5 text-sm font-medium text-text-secondary">{item.label}</p>
    </div>
  )
}

export function TransparencyStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  /* IntersectionObserver — kích hoạt count-up khi scroll vào view */
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect])

  return (
    <section className="py-10 md:py-14 bg-surface" id="transparency-stats" ref={ref}>
      <div className="container-main">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Minh bạch & Hiệu quả
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Thống kê giải quyết hồ sơ
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
          <p className="mt-3 text-sm text-text-secondary">
            Kỳ báo cáo: <span className="font-semibold text-primary">{STATS_DATA.period}</span>
          </p>
        </div>

        {/* Grid 4 card */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS_DATA.items.map((item, i) => (
            <StatCard key={item.label} item={item} isVisible={isVisible} index={i} />
          ))}
        </div>

        {/* Ghi chú nguồn dữ liệu */}
        <p className="text-center text-xs text-text-muted mt-6">
          * Số liệu được cập nhật hàng tháng từ hệ thống quản lý hồ sơ hành chính công
        </p>
      </div>
    </section>
  )
}
