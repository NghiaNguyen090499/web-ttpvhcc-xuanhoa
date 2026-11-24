/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Bố cục nội dung chính trang chủ — khu vực TIN NỔI BẬT / TIN MỚI toàn chiều rộng + 2 cột 70/30 theo mockup
 * @lienquan    : src/lib/static-data.ts, src/components/ProcedureGrid.tsx, src/components/DocumentDirective.tsx
 * @alias       : home-content-layout, trang-chu-2-cot
 */

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Megaphone,
  PlayCircle,
} from 'lucide-react'
import {
  getPortalNewsData,
  getPortalNiemYetData,
  getPortalTuyenTruyenData,
} from '@/lib/portal-db'
import { getVerticalMarqueeDuration } from '@/lib/marquee'
import type { NiemYetItem, TuyenTruyenItem } from '@/lib/static-data'
import { ProcedureGrid } from '@/components/ProcedureGrid'
import { DocumentDirective } from '@/components/DocumentDirective'
import { getFeaturedPropagandaImage, isPropagandaImage } from '@/lib/propaganda-media'
import { buildHomeNewsTabs } from '@/lib/home-news'
import { HomeNewsTabs } from '@/components/HomeNewsTabs'

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

function PropagandaImageFrame({
  item,
  className = '',
  sizes,
}: {
  item: TuyenTruyenItem
  className?: string
  sizes: string
}) {
  const src = item.mediaUrl || ''
  const isLocalImage = src.startsWith('/')
  const isExternalImage = /^https?:\/\//i.test(src) || /^data:image\//i.test(src) || /^blob:/i.test(src)

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {isLocalImage ? (
        <Image
          src={src}
          alt={item.title}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : isExternalImage ? (
        <div
          role="img"
          aria-label={item.title}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${src.replace(/"/g, '\\"')}")` }}
        />
      ) : (
        <div className="flex h-full min-h-[180px] w-full items-center justify-center text-sm font-semibold text-text-muted">
          Chưa có ảnh
        </div>
      )}
    </div>
  )
}

function PropagandaMediaCard({
  data,
  featuredVideoId,
}: {
  data: TuyenTruyenItem[]
  featuredVideoId?: string
}) {
  const mediaItems = data
    .filter((item) => item.mediaType === 'video' || item.mediaType === 'file')
  const featuredItem = featuredVideoId
    ? mediaItems.find((item) => item.id === featuredVideoId)
    : undefined
  const items = featuredItem ? [featuredItem] : mediaItems.slice(0, 1)

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold uppercase text-text-primary">
            Video nổi bật / Tuyên truyền
          </h2>
        </div>
        <Link href="/video-huong-dan" className="text-sm font-bold text-primary hover:text-primary-dark">
          Tất cả video
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-5 py-10 text-center md:min-h-[360px]">
          <p className="text-base font-semibold text-text-primary">Chưa có video/file tuyên truyền</p>
          <p className="mt-2 max-w-[620px] text-base leading-relaxed text-text-secondary">
            Nội dung sẽ hiển thị tại đây sau khi cán bộ đăng trong CMS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {items.map((item) => {
          const isVideo = item.mediaType === 'video'
          const isFile = item.mediaType === 'file'
          const isFeaturedVideo = item.id === featuredVideoId
          const Icon = isVideo ? PlayCircle : isFile ? Download : FileText
          const youtubeEmbedUrl = item.mediaUrl ? getYoutubeEmbedUrl(item.mediaUrl) : null

          if (isVideo) {
            return (
              <article
                key={item.id}
                className={`${isFeaturedVideo ? 'md:col-span-3' : ''} flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface`}
              >
                <div className={`${isFeaturedVideo ? 'md:min-h-[360px]' : ''} aspect-video bg-black`}>
                  {youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      title={item.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : item.mediaUrl ? (
                    <video
                      src={item.mediaUrl}
                      controls
                      preload="metadata"
                      className="h-full w-full bg-black"
                    >
                      Trình duyệt không hỗ trợ phát video.
                    </video>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                      Chưa có video
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase text-primary">
                    <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {isFeaturedVideo ? 'Video nổi bật' : 'Video'}
                  </span>
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                    {item.summary}
                  </p>
                </div>
              </article>
            )
          }

          if (!item.mediaUrl) {
            return (
              <article
                key={item.id}
                className="group flex min-h-[128px] flex-col rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {isFile ? 'File' : item.tag}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {item.summary}
                </p>
              </article>
            )
          }

          return (
            <a
              key={item.id}
              href={item.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[128px] flex-col rounded-xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase text-primary">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {isVideo ? 'Video' : isFile ? 'File' : item.tag}
                </span>
                {item.mediaUrl && <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-primary" aria-hidden="true" />}
              </div>
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text-primary group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                {item.summary}
              </p>
            </a>
          )
          })}
        </div>
      )}
    </section>
  )
}

function HotlineCard({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${className}`}>
      <a href="tel:1022" className="block h-full bg-[#dff1ff] transition hover:opacity-95" aria-label="Gọi Tổng đài 1022">
        <Image
          src="/images/hotline-1022.png"
          alt="Tổng đài 1022 - 5 kênh phản ánh 24/7"
          width={1952}
          height={806}
          className="h-full w-[106%] max-w-none -translate-x-[3%] object-cover"
          sizes="(max-width: 1024px) 106vw, 340px"
        />
      </a>
    </div>
  )
}

function PublicNoticesSidebarCard({ data }: { data: NiemYetItem[] }) {
  const latest = [...data]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const scrollItems = [...latest, ...latest]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#123f68] px-5 py-4 text-white">
        <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-bold uppercase tracking-wide">Niêm yết công khai</h3>
      </div>
      {latest.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">Chưa có văn bản niêm yết</p>
      ) : (
        <div className="directive-marquee directive-scroll-mask h-[320px] overflow-hidden px-4">
          <div
            className="animate-directive-scroll"
            style={{ animationDuration: getVerticalMarqueeDuration(latest.length) }}
          >
            {scrollItems.map((item, index) => (
              <a
                key={`${item.id}-${index}`}
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 border-b border-border py-4 transition hover:bg-primary-50"
              >
                <FileText className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary group-hover:text-primary">
                    {item.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                    <span>{formatDate(item.publishedAt)}</span>
                    {item.category && <span>•</span>}
                    {item.category && <span className="line-clamp-1">{item.category}</span>}
                    <span className="ml-auto font-bold text-primary">PDF</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      <Link
        href="/niem-yet"
        className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-50"
      >
        Xem tất cả niêm yết
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

function VideoGuideSidebarCard({
  data,
  featuredVideoId,
}: {
  data: TuyenTruyenItem[]
  featuredVideoId?: string
}) {
  const videos = data
    .filter((item) => item.mediaType === 'video' && item.mediaUrl && item.id !== featuredVideoId)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const scrollItems = [...videos, ...videos]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-primary px-5 py-4 text-white">
        <PlayCircle className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="font-heading text-base font-bold uppercase tracking-wide">
          Thư viện video
        </h3>
      </div>

      {videos.length > 0 ? (
        <div className="directive-marquee directive-scroll-mask h-[320px] overflow-hidden px-4">
          <div
            className="animate-directive-scroll"
            style={{ animationDuration: getVerticalMarqueeDuration(videos.length) }}
          >
            {scrollItems.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href="/video-huong-dan"
                className="group flex gap-3 border-b border-border py-4 transition hover:bg-primary-50"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <PlayCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-text-muted">
                    {formatDate(item.publishedAt)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-primary-50 px-4 text-center">
            <PlayCircle className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-text-primary">Chưa có video khác</p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Khi có thêm clip, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        </div>
      )}

      <Link
        href="/video-huong-dan"
        className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-50"
      >
        Xem thêm clip
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

function ImageGallerySidebarCard({
  data,
  featuredImageId,
}: {
  data: TuyenTruyenItem[]
  featuredImageId?: string
}) {
  const images = data.filter(isPropagandaImage)
  const displayImages = images
    .filter((item) => item.id !== featuredImageId)
    .slice(0, 8)
  const scrollItems = displayImages.length > 1 ? [...displayImages, ...displayImages] : displayImages

  if (displayImages.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#0f766e] px-5 py-4 text-white">
        <ImageIcon className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="font-heading text-base font-bold uppercase tracking-wide">
          Hình ảnh tuyên truyền
        </h3>
      </div>

      <div className="image-marquee image-scroll-mask overflow-hidden px-4 py-4">
        <div className={`flex w-max gap-3 ${displayImages.length > 1 ? 'animate-image-scroll-x' : ''}`}>
          {scrollItems.map((item, index) => (
            <article
              key={`${item.id}-${index}`}
              className="w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-surface"
            >
              <PropagandaImageFrame
                item={item}
                className="aspect-[4/3]"
                sizes="224px"
              />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-bold leading-snug text-text-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(item.publishedAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Link
        href="/hinh-anh"
        className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-50"
      >
        Xem tất cả hình ảnh
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

export async function HomeContentLayout() {
  const [news, propaganda, notices] = await Promise.all([
    getPortalNewsData(),
    getPortalTuyenTruyenData(),
    getPortalNiemYetData(),
  ])
  const homeNews = buildHomeNewsTabs(news)
  const featuredVideoId = (
    propaganda.find((item) => item.mediaType === 'video' && item.mediaUrl && item.isFeatured)
    || propaganda.find((item) => item.mediaType === 'video' && item.mediaUrl)
  )?.id
  const featuredImageId = getFeaturedPropagandaImage(propaganda)?.id

  return (
    <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-8 md:py-10">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="space-y-6">
          <HomeNewsTabs {...homeNews} />

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">
            <main className="flex flex-col gap-4 lg:gap-5">
              <PropagandaMediaCard data={propaganda} featuredVideoId={featuredVideoId} />
              <ProcedureGrid embedded className="-mt-[46px]" />
            </main>

            <aside className="flex flex-col gap-5">
              <HotlineCard />
              <PublicNoticesSidebarCard data={notices} />
              <DocumentDirective />
              <VideoGuideSidebarCard data={propaganda} featuredVideoId={featuredVideoId} />
              <ImageGallerySidebarCard data={propaganda} featuredImageId={featuredImageId} />
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
