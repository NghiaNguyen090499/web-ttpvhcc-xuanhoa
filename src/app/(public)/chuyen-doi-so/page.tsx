/**
 * @nhom        : Pages / Chuyển đổi số
 * @chucnang    : Trang thông tin chuyển đổi số, nội dung lấy từ CMS
 * @lienquan    : src/lib/digital-transformation.ts, src/app/admin/chuyen-doi-so/page.tsx
 * @alias       : digital-transformation-page, chuyen-doi-so
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { getDigitalTransformationContent, type DigitalResource } from '@/lib/digital-transformation'

export const metadata: Metadata = {
  title: 'Chuyển đổi số',
  description: 'Thông tin, hướng dẫn và tài nguyên chuyển đổi số phục vụ người dân, doanh nghiệp phường Xuân Hòa.',
}

export const dynamic = 'force-dynamic'

const HIGHLIGHT_ICONS = [Globe2, Database, GraduationCap, ShieldCheck]

function getResourceIcon(resource: DigitalResource) {
  if (resource.kind.toLowerCase().includes('văn bản')) return FileText
  if (resource.kind.toLowerCase().includes('dịch vụ')) return Globe2
  return ExternalLink
}

export default async function DigitalTransformationPage() {
  const data = await getDigitalTransformationContent()
  const resources = data.metadata.resources
    .filter((resource) => resource.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/65" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white btn-transition">Trang chủ</Link>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
            </svg>
            <span className="text-white/90">{data.title}</span>
          </nav>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">Thông tin phục vụ cộng đồng</p>
          <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold uppercase tracking-wide md:text-5xl">
            {data.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
            {data.metadata.summary}
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-white py-8 md:py-10">
        <div className="container-main grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.metadata.highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]
            return (
              <div key={`${item.label}-${index}`} className="flex gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight text-primary">{item.value}</p>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">{item.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-[#f5f8fb] py-10 md:py-14">
        <div className="container-main grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0 rounded-2xl border border-border bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] md:p-9">
            <div
              className="prose max-w-none text-sm leading-7 text-text-secondary [&_a]:text-primary [&_a]:underline [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_h3]:mt-7 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-text-primary [&_li]:my-1 [&_strong]:text-text-primary"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
            <p className="mt-8 border-t border-border pt-4 text-xs text-text-muted">
              Cập nhật nội dung: {data.metadata.updatedAt}
            </p>
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/15">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light">Bắt đầu từ hôm nay</p>
              <h2 className="mt-2 text-xl font-bold">Thực hiện thủ tục trực tuyến</h2>
              <p className="mt-2 text-sm leading-6 text-white/78">
                Tra cứu thành phần hồ sơ và nộp hồ sơ trên Cổng Dịch vụ công Quốc gia.
              </p>
              <a
                href="https://dichvucong.gov.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-[#4a3000] hover:bg-accent-light btn-transition"
              >
                Mở Cổng Dịch vụ công
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-primary">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Tài nguyên tham khảo</h2>
                  <p className="text-xs text-text-muted">Nguồn chính thức và hữu ích</p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-border">
                {resources.map((resource) => {
                  const Icon = getResourceIcon(resource)
                  return (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 py-4 first:pt-1 last:pb-1"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-text-primary group-hover:text-primary">{resource.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-text-muted">{resource.description}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
