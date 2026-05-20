/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Gallery ảnh bài viết tin tức — grid + lightbox xem phóng to
 * @input       : images (string[]) — danh sách đường dẫn ảnh
 *                title (string) — tiêu đề bài viết (alt text)
 * @output      : JSX gallery component
 * @lienquan    : src/app/(public)/tin-tuc/[slug]/page.tsx
 * @alias       : news-gallery, lightbox-gallery
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface NewsDetailGalleryProps {
  images: string[]
  title: string
}

export default function NewsDetailGallery({ images, title }: NewsDetailGalleryProps) {
  // Trạng thái lightbox — index ảnh đang xem, -1 là đóng
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  /**
   * @chucnang    : Mở lightbox tại index chỉ định
   */
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  /**
   * @chucnang    : Đóng lightbox
   */
  const closeLightbox = useCallback(() => {
    setLightboxIndex(-1)
  }, [])

  /**
   * @chucnang    : Chuyển ảnh trước/sau trong lightbox
   */
  const navigate = useCallback((direction: 'prev' | 'next') => {
    setLightboxIndex((prev) => {
      if (direction === 'prev') return prev <= 0 ? images.length - 1 : prev - 1
      return prev >= images.length - 1 ? 0 : prev + 1
    })
  }, [images.length])

  // Xử lý phím tắt khi lightbox mở
  useEffect(() => {
    if (lightboxIndex < 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }

    // Khóa cuộn trang
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, closeLightbox, navigate])

  // Bỏ qua ảnh đầu tiên (đã hiển thị ở ảnh chính)
  const galleryImages = images.slice(1)

  if (galleryImages.length === 0) return null

  return (
    <>
      {/* Grid ảnh phụ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            📷 Hình ảnh ({images.length})
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx + 1)}
              className="relative cursor-zoom-in overflow-hidden rounded-lg bg-surface group focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ aspectRatio: '4/3' }}
              aria-label={`Xem ảnh ${idx + 2} — ${title}`}
            >
              <Image
                src={img}
                alt={`${title} — ảnh ${idx + 2}`}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox — fullscreen overlay */}
      {lightboxIndex >= 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Xem ảnh phóng to"
        >
          {/* Nút đóng */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Nút trước */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate('prev') }}
              className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Ảnh trước"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Ảnh đang xem */}
          <div
            className="relative w-[90vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} — ảnh ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Nút sau */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate('next') }}
              className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Ảnh sau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 2 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx) }}
                  className={`relative w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
