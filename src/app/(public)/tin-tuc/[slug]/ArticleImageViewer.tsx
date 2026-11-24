/**
 * @nhom        : Pages / Tin tức (Client)
 * @chucnang    : Bấm ảnh trong bài viết để mở trình xem có zoom
 *                - ArticleImageViewerProvider: giữ trạng thái trình xem cho cả trang
 *                - ZoomableCover: ảnh chính đầu bài
 *                - ZoomableArticleHtml: nội dung HTML — mọi <img> trong bài bấm được
 * @lienquan    : src/components/ImageZoomViewer.tsx, ./NewsDetailGallery.tsx, ./page.tsx
 * @alias       : article-image-viewer, zoom-anh-bai-viet
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { ImageZoomViewer, type ViewerImage } from '@/components/ImageZoomViewer'

type OpenViewer = (images: ViewerImage[], index: number) => void

const ViewerContext = createContext<OpenViewer>(() => {})

export function useArticleImageViewer() {
  return useContext(ViewerContext)
}

export function ArticleImageViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ images: ViewerImage[]; index: number } | null>(null)
  const open = useCallback<OpenViewer>((images, index) => {
    if (images.length > 0) setState({ images, index })
  }, [])

  return (
    <ViewerContext.Provider value={open}>
      {children}
      {state && (
        <ImageZoomViewer
          images={state.images}
          index={state.index}
          onClose={() => setState(null)}
          onIndexChange={(index) => setState((prev) => (prev ? { ...prev, index } : prev))}
        />
      )}
    </ViewerContext.Provider>
  )
}

/** Danh sách ảnh của bài (ảnh chính + gallery) → dạng dùng cho trình xem */
export function toViewerImages(images: string[], title: string): ViewerImage[] {
  return images.map((src, i) => ({ src, alt: images.length > 1 ? `${title} — ảnh ${i + 1}` : title }))
}

export function ZoomableCover({ src, images, title }: { src: string; images: string[]; title: string }) {
  const open = useArticleImageViewer()
  if (!src) return null

  const onOpen = () => {
    const index = images.indexOf(src)
    if (index >= 0) open(toViewerImages(images, title), index)
    else open(toViewerImages([src, ...images], title), 0)
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full cursor-zoom-in bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      style={{ aspectRatio: '16/10' }}
      aria-label={`Phóng to ảnh: ${title}`}
    >
      <Image src={src} alt={title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 720px" priority />
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-90 backdrop-blur-sm transition group-hover:bg-black/75 group-hover:opacity-100">
        <ZoomIn className="h-4 w-4" aria-hidden="true" />
        Bấm để phóng to
      </span>
    </button>
  )
}

/**
 * @chucnang    : Render nội dung bài (HTML đã sanitize ở server) và cho phép bấm ảnh trong bài để zoom
 */
export function ZoomableArticleHtml({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const open = useArticleImageViewer()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const imgs = () => [...root.querySelectorAll('img')].filter((img) => img.currentSrc || img.src)

    imgs().forEach((img) => {
      // Ảnh nằm trong link thì giữ hành vi link
      if (img.closest('a')) return
      img.style.cursor = 'zoom-in'
      img.setAttribute('tabindex', '0')
      img.setAttribute('role', 'button')
      if (!img.getAttribute('aria-label')) img.setAttribute('aria-label', `Phóng to ảnh${img.alt ? `: ${img.alt}` : ''}`)
    })

    const openFrom = (target: EventTarget | null) => {
      if (!(target instanceof HTMLImageElement) || target.closest('a')) return false
      const list = imgs().filter((img) => !img.closest('a'))
      const index = list.indexOf(target)
      if (index < 0) return false
      open(list.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt || 'Ảnh trong bài viết' })), index)
      return true
    }
    const onClick = (e: MouseEvent) => { openFrom(e.target) }
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && openFrom(e.target)) e.preventDefault()
    }
    root.addEventListener('click', onClick)
    root.addEventListener('keydown', onKey)
    return () => {
      root.removeEventListener('click', onClick)
      root.removeEventListener('keydown', onKey)
    }
  }, [html, open])

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
