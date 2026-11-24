/**
 * @nhom        : Components / Media
 * @chucnang    : Trình xem ảnh toàn màn hình có zoom — đọc rõ ảnh chụp văn bản, thông báo
 *                - Zoom: nút +/−, cuộn chuột, nhấp đúp, chụm 2 ngón (mobile), phím + / − / 0
 *                - Kéo để di chuyển khi đang phóng to; ←/→ chuyển ảnh; Esc đóng
 *                - Hiển thị ảnh gốc (không qua tối ưu/nén) để chữ rõ nét
 * @lienquan    : src/app/(public)/tin-tuc/[slug]/ArticleImageViewer.tsx
 * @alias       : image-zoom-viewer, lightbox-zoom, xem-anh-phong-to
 */

'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Minus, Plus, X } from 'lucide-react'

export interface ViewerImage {
  src: string
  alt: string
}

const MIN_SCALE = 1
const MAX_SCALE = 6
const STEP = 1.5
const DOUBLE_CLICK_SCALE = 2.5

interface Transform { scale: number; x: number; y: number }
const IDENTITY: Transform = { scale: 1, x: 0, y: 0 }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ImageZoomViewer({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: ViewerImage[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}) {
  const [transform, setTransform] = useState<Transform>(IDENTITY)
  const [loaded, setLoaded] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ startDist: number; startScale: number; lastX: number; lastY: number; moved: boolean } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null)
  const lastPointerType = useRef<string>('mouse')

  const current = images[index]
  const hasMany = images.length > 1

  /** Giới hạn vùng kéo để ảnh không trôi ra khỏi khung */
  const constrain = useCallback((t: Transform): Transform => {
    const stage = stageRef.current
    const img = imgRef.current
    const scale = clamp(t.scale, MIN_SCALE, MAX_SCALE)
    if (!stage || !img || scale <= 1) return { scale, x: 0, y: 0 }
    const maxX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2)
    const maxY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2)
    return { scale, x: clamp(t.x, -maxX, maxX), y: clamp(t.y, -maxY, maxY) }
  }, [])

  /** Zoom quanh một điểm (toạ độ màn hình); không truyền điểm → zoom quanh tâm */
  const zoomTo = useCallback((nextScale: number, clientX?: number, clientY?: number) => {
    setTransform((prev) => {
      const stage = stageRef.current
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE)
      if (!stage || clientX === undefined || clientY === undefined) {
        return constrain({ scale, x: prev.x * (scale / prev.scale), y: prev.y * (scale / prev.scale) })
      }
      const rect = stage.getBoundingClientRect()
      const px = clientX - (rect.left + rect.width / 2)
      const py = clientY - (rect.top + rect.height / 2)
      const ratio = scale / prev.scale
      return constrain({ scale, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio })
    })
  }, [constrain])

  const reset = useCallback(() => setTransform(IDENTITY), [])

  const go = useCallback((delta: number) => {
    if (!hasMany) return
    onIndexChange((index + delta + images.length) % images.length)
  }, [hasMany, images.length, index, onIndexChange])

  // Đổi ảnh → về kích thước vừa khung (điều chỉnh state ngay khi render, không cần effect)
  const [shownIndex, setShownIndex] = useState(index)
  if (shownIndex !== index) {
    setShownIndex(index)
    setTransform(IDENTITY)
    setLoaded(false)
  }

  // Phím tắt + khoá cuộn trang + trả focus khi đóng
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === '+' || e.key === '=') setTransform((t) => constrain({ ...t, scale: t.scale * STEP }))
      else if (e.key === '-' || e.key === '_') setTransform((t) => constrain({ scale: t.scale / STEP, x: t.x / STEP, y: t.y / STEP }))
      else if (e.key === '0') reset()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus?.()
    }
  }, [constrain, go, onClose, reset])

  // Đổi kích thước cửa sổ → giữ ảnh trong khung
  useEffect(() => {
    const onResize = () => setTransform((t) => constrain(t))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [constrain])

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const factor = Math.exp(-e.deltaY * 0.0025)
    zoomTo(transform.scale * factor, e.clientX, e.clientY)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    lastPointerType.current = e.pointerType
    setInteracting(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    gesture.current = {
      startDist: pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startScale: transform.scale,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    const g = gesture.current

    if (pts.length >= 2 && g.startDist > 0) {
      // Chụm 2 ngón
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      g.moved = true
      zoomTo(g.startScale * (dist / g.startDist), (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2)
      return
    }

    // Kéo để di chuyển
    const dx = e.clientX - g.lastX
    const dy = e.clientY - g.lastY
    if (Math.abs(dx) + Math.abs(dy) > 2) g.moved = true
    g.lastX = e.clientX
    g.lastY = e.clientY
    if (transform.scale > 1) setTransform((t) => constrain({ ...t, x: t.x + dx, y: t.y + dy }))
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) {
      gesture.current = null
      setInteracting(false)
      if (g && !g.moved) {
        // Chạm đúp trên màn hình cảm ứng (trình duyệt mobile không phát dblclick ổn định)
        if (e.pointerType === 'touch') {
          const now = Date.now()
          const prev = lastTap.current
          if (prev && now - prev.time < 300 && Math.hypot(prev.x - e.clientX, prev.y - e.clientY) < 30) {
            lastTap.current = null
            if (transform.scale > 1) reset()
            else zoomTo(DOUBLE_CLICK_SCALE, e.clientX, e.clientY)
            return
          }
          lastTap.current = { time: now, x: e.clientX, y: e.clientY }
        }
        // Chạm/bấm ra nền ngoài ảnh khi chưa phóng to → đóng
        const rect = imgRef.current?.getBoundingClientRect()
        const onImage = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
        if (transform.scale === 1 && !onImage) onClose()
      }
    } else if (g) {
      const [p] = [...pointers.current.values()]
      g.lastX = p.x
      g.lastY = p.y
      g.startDist = 0
    }
  }

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lastPointerType.current === 'touch') return // đã xử lý chạm đúp ở onPointerUp
    if (transform.scale > 1) reset()
    else zoomTo(DOUBLE_CLICK_SCALE, e.clientX, e.clientY)
  }

  if (!current) return null

  const percent = Math.round(transform.scale * 100)
  const buttonClass = 'flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Xem ảnh phóng to">
      {/* Thanh trên */}
      <div className="flex items-center gap-3 px-3 py-2 text-white sm:px-4">
        {hasMany && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{index + 1} / {images.length}</span>
        )}
        <p className="line-clamp-1 flex-1 text-sm text-white/80">{current.alt}</p>
        <a
          href={current.src}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Mở ảnh gốc trong tab mới"
          title="Mở ảnh gốc"
        >
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
        </a>
        <button ref={closeRef} type="button" onClick={onClose} className={buttonClass} aria-label="Đóng" title="Đóng (Esc)">
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Vùng ảnh */}
      <div
        ref={stageRef}
        className={`relative flex flex-1 touch-none select-none items-center justify-center overflow-hidden ${
          transform.scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        {!loaded && (
          <span className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- cần ảnh gốc độ phân giải đầy đủ để zoom đọc chữ */}
        <img
          key={current.src}
          ref={imgRef}
          src={current.src}
          alt={current.alt}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className="pointer-events-none max-h-full max-w-full object-contain will-change-transform"
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transition: interacting ? 'none' : 'transform 0.15s ease-out',
            opacity: loaded ? 1 : 0,
          }}
        />

        {hasMany && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 sm:left-4"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 sm:right-4"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thanh zoom */}
      <div className="flex flex-col items-center gap-1 px-3 pb-3 pt-2">
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
          <button type="button" onClick={() => zoomTo(transform.scale / STEP)} disabled={transform.scale <= MIN_SCALE} className={buttonClass} aria-label="Thu nhỏ" title="Thu nhỏ (−)">
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums text-white" aria-live="polite">{percent}%</span>
          <button type="button" onClick={() => zoomTo(transform.scale * STEP)} disabled={transform.scale >= MAX_SCALE} className={buttonClass} aria-label="Phóng to" title="Phóng to (+)">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="mx-1 h-5 w-px bg-white/20" aria-hidden="true" />
          <button type="button" onClick={reset} disabled={transform.scale === 1} className={buttonClass} aria-label="Vừa khung hình" title="Vừa khung hình (0)">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="hidden text-xs text-white/50 sm:block">Cuộn chuột hoặc nhấp đúp để phóng to · Kéo để di chuyển</p>
        <p className="text-xs text-white/50 sm:hidden">Chụm 2 ngón hoặc chạm đúp để phóng to</p>
      </div>
    </div>
  )
}
