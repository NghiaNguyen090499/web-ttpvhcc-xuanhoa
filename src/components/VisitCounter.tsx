/**
 * @nhom        : Components / Layout
 * @chucnang    : Hiển thị tổng lượt truy cập ở footer, ghi nhận 1 lượt mỗi lần tải/chuyển trang
 * @lienquan    : src/app/api/visits/route.ts, src/components/Footer.tsx
 * @alias       : visit-counter, luot-truy-cap
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function VisitCounter() {
  const pathname = usePathname()
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/visits', { method: 'POST', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.total === 'number') setTotal(data.total)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <p aria-live="polite">
      Lượt truy cập:{' '}
      <span className="font-semibold text-white/80 tabular-nums">
        {total === null ? '…' : total.toLocaleString('vi-VN')}
      </span>
    </p>
  )
}
