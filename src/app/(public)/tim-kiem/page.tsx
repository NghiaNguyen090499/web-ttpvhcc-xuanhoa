import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, FileSearch, Newspaper, Search, FileText, HelpCircle } from 'lucide-react'
import SiteSearchForm from '@/components/SiteSearchForm'
import { searchSite, type SiteSearchResult, type SiteSearchType } from '@/lib/site-search'

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm kiếm thủ tục hành chính, tin tức, FAQ, văn bản và niêm yết công khai trên Cổng thông tin TTPVHCC Xuân Hòa.',
}

export const revalidate = 60

const TYPE_META: Record<SiteSearchType, {
  name: string
  className: string
  icon: typeof Search
}> = {
  procedure: {
    name: 'Thủ tục',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FileSearch,
  },
  news: {
    name: 'Tin tức',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Newspaper,
  },
  faq: {
    name: 'FAQ',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: HelpCircle,
  },
  document: {
    name: 'Văn bản',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: FileText,
  },
  notice: {
    name: 'Niêm yết',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: FileText,
  },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function ResultItem({ result }: { result: SiteSearchResult }) {
  const meta = TYPE_META[result.type]
  const Icon = meta.icon
  const date = formatDate(result.date)
  const content = (
    <article className="group rounded-2xl border border-border bg-white p-5 transition hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.className}`}>
          <Icon className="h-5 w-5" strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
              {meta.name}
            </span>
            {result.label && (
              <span className="text-xs font-medium text-text-muted">{result.label}</span>
            )}
            {date && <span className="text-xs text-text-muted">{date}</span>}
          </div>
          <h2 className="mt-2 text-base font-bold leading-snug text-text-primary group-hover:text-primary md:text-lg">
            {result.title}
          </h2>
          {result.description && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{result.description}</p>
          )}
        </div>
        {result.external && <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-text-muted" />}
      </div>
    </article>
  )

  if (result.external) {
    return (
      <a href={result.href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return <Link href={result.href} className="block">{content}</Link>
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()
  const results = query ? await searchSite(query) : []
  const counts = results.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Partial<Record<SiteSearchType, number>>)

  return (
    <>
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">Tìm kiếm</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Tìm kiếm
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Tìm thủ tục hành chính, tin tức, câu hỏi thường gặp, văn bản chỉ đạo và niêm yết công khai.
          </p>

          <div className="mt-6 max-w-3xl">
            <SiteSearchForm
              defaultValue={query}
              placeholder="Nhập nội dung cần tìm..."
              tone="hero"
            />
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main">
          {!query ? (
            <div className="rounded-2xl border border-border bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-text-primary">Nhập từ khóa để tìm kiếm</h2>
              <p className="mt-2 text-sm text-text-muted">Ví dụ: căn cước, hộ tịch, xây dựng, niêm yết, giấy phép.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-semibold text-primary">Kết quả tìm kiếm</p>
                  <h2 className="mt-1 text-2xl font-bold text-text-primary">
                    {results.length} kết quả cho &ldquo;{query}&rdquo;
                  </h2>
                </div>
                {results.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_META).map(([type, meta]) => {
                      const count = counts[type as SiteSearchType] || 0
                      if (!count) return null
                      return (
                        <span key={type} className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.name}: {count}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-text-muted">
                    <Search className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-text-primary">Không tìm thấy kết quả phù hợp</h2>
                  <p className="mt-2 text-sm text-text-muted">Thử từ khóa ngắn hơn hoặc dùng tên lĩnh vực/thủ tục phổ biến.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <ResultItem key={result.id} result={result} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
