/**
 * @nhom        : Components / Tin tức
 * @chucnang    : Gallery ảnh bài viết tin tức — grid; bấm ảnh mở trình xem có zoom (ArticleImageViewer)
 * @input       : images (string[]) — danh sách đường dẫn ảnh
 *                title (string) — tiêu đề bài viết (alt text)
 * @output      : JSX gallery component
 * @lienquan    : src/app/(public)/tin-tuc/[slug]/page.tsx
 * @alias       : news-gallery, lightbox-gallery
 */

'use client'

import Image from 'next/image'
import { toViewerImages, useArticleImageViewer } from './ArticleImageViewer'

interface NewsDetailGalleryProps {
  images: string[]
  title: string
}

export default function NewsDetailGallery({ images, title }: NewsDetailGalleryProps) {
  const openViewer = useArticleImageViewer()
  const openLightbox = (index: number) => openViewer(toViewerImages(images, title), index)

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

    </>
  )
}
