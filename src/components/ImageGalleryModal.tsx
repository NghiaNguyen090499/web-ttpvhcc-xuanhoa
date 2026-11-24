/**
 * @nhom        : Components / Hình ảnh
 * @chucnang    : Lưới ảnh tuyên truyền — bấm ảnh mở trình xem có zoom (ImageZoomViewer)
 * @lienquan    : src/app/(public)/hinh-anh/page.tsx, src/components/ImageZoomViewer.tsx
 * @alias       : image-gallery-modal, thu-vien-anh
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CalendarDays, ZoomIn } from 'lucide-react'
import type { TuyenTruyenItem } from '@/lib/static-data'
import { ImageZoomViewer } from '@/components/ImageZoomViewer'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function safeBackgroundUrl(value: string) {
  return value.replace(/"/g, '\\"')
}

function GalleryImage({ item, contain = false }: { item: TuyenTruyenItem; contain?: boolean }) {
  const src = item.mediaUrl || ''
  const isLocal = src.startsWith('/')
  const isExternal = /^https?:\/\//i.test(src) || /^data:image\//i.test(src) || /^blob:/i.test(src)
  const imageClass = contain ? 'object-contain' : 'object-cover transition duration-300 group-hover:scale-[1.03]'

  if (isLocal) {
    return <Image src={src} alt={item.title} fill className={imageClass} sizes={contain ? '92vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'} />
  }

  if (isExternal) {
    return (
      <div
        role="img"
        aria-label={item.title}
        className={`absolute inset-0 bg-center bg-no-repeat ${contain ? 'bg-contain' : 'bg-cover transition duration-300 group-hover:scale-[1.03]'}`}
        style={{ backgroundImage: `url("${safeBackgroundUrl(src)}")` }}
      />
    )
  }

  return <div className="flex h-full items-center justify-center text-sm font-semibold text-text-muted">Chưa có ảnh</div>
}

export function ImageGalleryModal({ items }: { items: TuyenTruyenItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const viewerImages = items
    .filter((item) => item.mediaUrl)
    .map((item) => ({ src: item.mediaUrl as string, alt: item.title }))
  const openViewer = (item: TuyenTruyenItem) => {
    const index = viewerImages.findIndex((image) => image.src === item.mediaUrl)
    if (index >= 0) setSelectedIndex(index)
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
            <button
              type="button"
              onClick={() => openViewer(item)}
              className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-surface text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-label={`Xem ảnh: ${item.title}`}
            >
              <GalleryImage item={item} />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" /> Phóng to
              </span>
            </button>
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-text-muted">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{formatDate(item.publishedAt)}</span><span>•</span><span>{item.tag}</span>
              </div>
              <h2 className="line-clamp-2 text-lg font-bold leading-snug text-text-primary">{item.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">{item.summary}</p>
            </div>
          </article>
        ))}
      </div>

      {selectedIndex !== null && (
        <ImageZoomViewer
          images={viewerImages}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onIndexChange={setSelectedIndex}
        />
      )}
    </>
  )
}
