/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Bố cục nội dung chính trang chủ — 2 cột 70/30 theo mockup
 * @lienquan    : src/lib/static-data.ts, src/components/ProcedureGrid.tsx
 * @alias       : home-content-layout, trang-chu-2-cot
 */

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Megaphone,
  Phone,
  Tag,
  UploadCloud,
} from 'lucide-react'
import { getNewsData, getNiemYetData, getTuyenTruyenData } from '@/lib/static-data'
import { ProcedureGrid } from '@/components/ProcedureGrid'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function NewsCards() {
  const allNews = getNewsData()
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

function PropagandaUploadCard() {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c7b8ff] bg-gradient-to-br from-primary-50 via-white to-[#f3edff] px-6 py-8 text-center">
        <UploadCloud className="h-14 w-14 text-primary" strokeWidth={1.8} aria-hidden="true" />
        <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wide text-[#7c63f0] md:text-3xl">
          Video/File/Tuyên truyền
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Kéo thả tập tin vào đây hoặc <span className="font-bold text-primary">chọn tệp</span> để tải lên
        </p>
      </div>
    </section>
  )
}

function FeaturedSidebarCard() {
  const [featured] = getTuyenTruyenData()

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

function HotlineCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Phone className="h-5 w-5 text-danger" aria-hidden="true" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-text-primary">Số tổng đài</h3>
      </div>
      <div className="px-6 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Tổng đài</p>
        <p className="mt-2 font-heading text-6xl font-bold leading-none text-primary">1022</p>
        <p className="mx-auto mt-4 max-w-[220px] text-sm leading-relaxed text-text-secondary">
          Kênh tiếp nhận phản ánh, kiến nghị và hỗ trợ thông tin nhanh liên quan đến TTHC
        </p>
        <a
          href="tel:1022"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Gọi ngay
        </a>
      </div>
    </div>
  )
}

function PublicNoticesSidebarCard() {
  const latest = getNiemYetData().slice(0, 4)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#123f68] px-5 py-4 text-white">
        <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-bold uppercase tracking-wide">Niêm yết công khai</h3>
      </div>
      <div className="divide-y divide-border px-4">
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
    </div>
  )
}

export function HomeContentLayout() {
  return (
    <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-8 md:py-10">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">
          <main className="space-y-6">
            <NewsCards />
            <PropagandaUploadCard />
            <ProcedureGrid embedded />
          </main>

          <aside className="flex flex-col gap-5">
            <FeaturedSidebarCard />
            <HotlineCard />
            <PublicNoticesSidebarCard />
          </aside>
        </div>
      </div>
    </section>
  )
}
