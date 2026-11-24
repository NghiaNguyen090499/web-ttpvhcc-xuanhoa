/**
 * @nhom        : Pages / Video hướng dẫn
 * @chucnang    : Trang danh sách toàn bộ video hướng dẫn từ CMS tuyên truyền
 * @lienquan    : src/lib/portal-db.ts, src/components/HomeContentLayout.tsx
 * @alias       : video-huong-dan, clips, tutorial-videos
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, PlayCircle } from 'lucide-react'
import { getPortalTuyenTruyenData } from '@/lib/portal-db'
import { notFound } from 'next/navigation'
import { Pagination, PageRangeInfo } from '@/components/Pagination'
import { paginate, parsePage, type PageSearchParams } from '@/lib/pagination'

export const metadata: Metadata = {
  title: 'Video hướng dẫn',
  description: 'Tổng hợp các video hướng dẫn, clip tuyên truyền và nội dung hỗ trợ người dân tại TTPVHCC Phường Xuân Hòa.',
}

export const revalidate = 60

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}

export default async function VideoGuidePage({ searchParams }: { searchParams: PageSearchParams }) {
  const items = await getPortalTuyenTruyenData()
  const { items: videos, page, totalPages, total, offset, outOfRange } = paginate(
    items.filter((item) => item.mediaType === 'video' && item.mediaUrl),
    parsePage((await searchParams).page),
  )
  if (outOfRange) notFound()

  return (
    <>
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Trang chủ
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Video hướng dẫn
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Xem lại các clip hướng dẫn thủ tục, tuyên truyền chuyển đổi số và nội dung hỗ trợ người dân.
          </p>
        </div>
      </section>

      <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-10 md:py-14">
        <div className="container-main">
          {total === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <PlayCircle className="h-14 w-14 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-text-primary">Chưa có video hướng dẫn</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                Các video sẽ xuất hiện tại đây sau khi cán bộ cập nhật trong hệ thống quản trị.
              </p>
            </div>
          ) : (
            <>
            <div className="mb-5"><PageRangeInfo offset={offset} count={videos.length} total={total} unit="video" /></div>
            <div className="grid gap-6 lg:grid-cols-2">
              {videos.map((item) => {
                const youtubeEmbedUrl = item.mediaUrl ? getYoutubeEmbedUrl(item.mediaUrl) : null

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  >
                    <div className="aspect-video bg-black">
                      {youtubeEmbedUrl ? (
                        <iframe
                          src={youtubeEmbedUrl}
                          title={item.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={item.mediaUrl}
                          controls
                          preload="metadata"
                          className="h-full w-full bg-black"
                        >
                          Trình duyệt không hỗ trợ phát video.
                        </video>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-text-muted">
                        <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{formatDate(item.publishedAt)}</span>
                        <span>•</span>
                        <span>{item.tag}</span>
                      </div>
                      <h2 className="line-clamp-2 text-lg font-bold leading-snug text-text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                        {item.summary}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/video-huong-dan" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
