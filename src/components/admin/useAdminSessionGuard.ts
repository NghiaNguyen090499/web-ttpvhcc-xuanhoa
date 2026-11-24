/**
 * @nhom        : Components / Admin
 * @chucnang    : Giữ phiên khi cán bộ đang thao tác, tự đăng xuất khi không thao tác quá 30 phút
 * @lienquan    : src/app/api/admin/session/route.ts, src/lib/session-token.ts, src/components/admin/AdminShell.tsx
 * @alias       : idle-logout, session-guard
 */

'use client'

import { useEffect } from 'react'

const IDLE_LIMIT_MS = 30 * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 1000
const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const

export function useAdminSessionGuard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    let lastActivity = Date.now()
    let lastKeepalive = Date.now()
    let leaving = false

    const goToLogin = () => {
      if (leaving) return
      leaving = true
      const from = window.location.pathname
      window.location.assign(`/admin/login?from=${encodeURIComponent(from)}`)
    }

    const markActive = () => {
      lastActivity = Date.now()
    }

    const tick = async () => {
      const now = Date.now()
      if (now - lastActivity >= IDLE_LIMIT_MS) {
        // Không thao tác quá lâu → rời màn hình chứa dữ liệu công vụ
        goToLogin()
        return
      }

      // Còn thao tác (kể cả chỉ gõ trong trình soạn thảo) → ping để proxy gia hạn phiên
      if (lastActivity > lastKeepalive && now - lastKeepalive >= KEEPALIVE_INTERVAL_MS) {
        lastKeepalive = now
        try {
          const res = await fetch('/api/admin/session', { cache: 'no-store' })
          if (res.status === 401) goToLogin()
        } catch {
          // Mất mạng tạm thời — thử lại ở lần sau
        }
      }
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }))
    const timer = window.setInterval(tick, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive))
      window.clearInterval(timer)
    }
  }, [enabled])
}
