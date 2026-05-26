/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Bố cục nội dung chính trang chủ — 2 cột 70/30 theo mockup
 * @lienquan    : src/lib/static-data.ts, src/components/ProcedureGrid.tsx, src/components/DocumentDirective.tsx
 * @alias       : home-content-layout, trang-chu-2-cot
 */

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Megaphone,
  PlayCircle,
  Tag,
} from 'lucide-react'
import {
  getPortalNewsData,
  getPortalNiemYetData,
  getPortalTuyenTruyenData,
} from '@/lib/portal-db'
import type { NewsItem, NiemYetItem, TuyenTruyenItem } from '@/lib/static-data'
import { ProcedureGrid } from '@/components/ProcedureGrid'
import { DocumentDirective } from '@/components/DocumentDirective'

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

function NewsCards({ allNews }: { allNews: NewsItem[] }) {
  const latestNews = allNews.slice(0, 3)

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {latestNews.map((item) => (
          <Link
            key={item.id}
            href={`/tin-tuc/${item.slug}`}
            className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_10px_28px_rgba(8,79,143,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(8,79,143,0.14)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 35vw, 250px"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{formatDate(item.date)}</span>
              </div>
              <h3 className="line-clamp-2 text-base font-bold uppercase leading-snug text-text-primary transition group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                {item.excerpt}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold uppercase text-primary">
                Xem ngay
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/tin-tuc"
          className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary transition hover:text-primary-dark"
        >
          Xem tất cả tin tức
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium text-text-muted">({allNews.length} bài)</span>
        </Link>
      </div>
    </section>
  )
}

function PropagandaMediaCard({ data }: { data: TuyenTruyenItem[] }) {
  const items = data
    .filter((item) => item.mediaType === 'video' || item.mediaType === 'file' || Boolean(item.mediaUrl))
    .slice(0, 3)
  const featuredVideoId = items.find((item) => item.mediaType === 'video')?.id

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold uppercase text-text-primary">
            Video/File/Tuyên truyền
          </h2>
        </div>
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
                    Video
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

function FeaturedSidebarCard({ featured }: { featured?: TuyenTruyenItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <Link
        href="/tin-tuc"
        className="flex items-center gap-3 bg-primary px-5 py-4 text-white transition hover:bg-primary-dark"
      >
        <Megaphone className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-bold">Xem chi tiết</span>
        <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
      </Link>
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-5 text-white">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" aria-hidden="true" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Nổi bật hôm nay</h3>
        </div>
        <h4 className="text-base font-bold leading-snug">
          {featured?.title || 'Cập nhật thông tin tuyên truyền mới nhất'}
        </h4>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/90">
          {featured?.summary || 'Theo dõi các thông tin phục vụ người dân và hoạt động hành chính công tại phường Xuân Hòa.'}
        </p>
        <Link href="/tin-tuc" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
          Xem chi tiết
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
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
  const latest = data.slice(0, 5)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#123f68] px-5 py-4 text-white">
        <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-bold uppercase tracking-wide">Niêm yết công khai</h3>
      </div>
      <div className="divide-y divide-border p-[15px]">
        {latest.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Chưa có văn bản niêm yết</p>
        ) : (
          latest.map((item) => (
            <a
              key={item.id}
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 py-4 transition hover:bg-primary-50"
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
          ))
        )}
      </div>
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

export async function HomeContentLayout() {
  const [news, propaganda, notices] = await Promise.all([
    getPortalNewsData(),
    getPortalTuyenTruyenData(),
    getPortalNiemYetData(),
  ])
  const [featuredPropaganda] = propaganda

  return (
    <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-8 md:py-10">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">
            <NewsCards allNews={news} />
            <aside className="flex h-full flex-col gap-5">
              <FeaturedSidebarCard featured={featuredPropaganda} />
              <HotlineCard className="lg:flex-1" />
            </aside>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">
            <main className="space-y-6">
              <PropagandaMediaCard data={propaganda} />
              <ProcedureGrid embedded />
            </main>

            <aside className="flex flex-col gap-5">
              <PublicNoticesSidebarCard data={notices} />
              <DocumentDirective />
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
