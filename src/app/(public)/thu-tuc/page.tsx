/**
 * @nhom        : Pages / Thủ tục
 * @chucnang    : Trang danh mục TTHC — search + danh sách link DVC + grid lĩnh vực
 * @lienquan    : src/lib/static-data.ts, data/procedures.json
 * @alias       : procedures, thu-tuc
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getProcedureLinksData, getProceduresData } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Thủ tục Hành chính',
  description: 'Tra cứu danh mục thủ tục hành chính thuộc thẩm quyền giải quyết tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

export default function ProceduresPage() {
  const data = getProceduresData()
  const categories = data.categories
  const thuongGap = data.thuongGap
  const procedureLinks = getProcedureLinksData()

  return (
    <>
      {/* Hero — xanh công nghệ */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Tra cứu thủ tục</p>
          <h1 className="mt-2 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Thủ tục Hành chính
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Tra cứu danh mục thủ tục hành chính thuộc thẩm quyền giải quyết của UBND Phường Xuân Hòa.
            Bấm vào từng thủ tục để mở trực tiếp trên Cổng Dịch vụ công Quốc gia.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="flex flex-1 items-center gap-3 px-4">
              <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Tìm theo tên thủ tục hoặc mã số..." className="w-full border-0 bg-transparent py-4 text-sm text-text-primary outline-none placeholder:text-text-muted" />
            </div>
            <button className="bg-accent px-6 text-sm font-bold text-[#5a3200] hover:bg-accent-dark btn-transition">Tìm kiếm</button>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* === Link thủ tục trực tuyến từ Cổng DVC === */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-accent" />
              <div>
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-text-primary">
                  Danh sách thủ tục trực tuyến
                </h2>
                <p className="text-sm text-text-muted">
                  {procedureLinks.metadata.totalLinks} đường dẫn DVC Quốc gia — cập nhật từ file Excel
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {procedureLinks.groups.map((group) => (
                <details key={group.slug} className="group rounded-2xl border border-border bg-white open:shadow-lg">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                      {group.items.length}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-text-primary">{group.name}</span>
                      <span className="block text-sm text-text-muted">{group.items.length} thủ tục có link trực tuyến</span>
                    </span>
                    <svg className="h-5 w-5 text-text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="max-h-[460px] overflow-y-auto border-t border-border p-3">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-cream btn-transition"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-7.5M15 4h5m0 0v5m0-5L10 14" />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-snug text-text-primary">{item.name}</span>
                            {item.code && <span className="mt-1 block text-xs text-text-muted">Mã thủ tục: {item.code}</span>}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* === Thủ tục cấp phường === */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide">Thủ tục cấp phường</h2>
                <p className="text-sm text-text-muted">{categories.length} lĩnh vực — {categories.reduce((sum, c) => sum + c.subCategories.length, 0)} nhóm thủ tục</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div key={cat.slug} className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-lg btn-transition">
                  <Link href={`/thu-tuc/${cat.slug}`} className="block p-5 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-primary">{cat.name}</h3>
                        <p className="text-xs text-text-muted">{cat.subCategories.length} nhóm thủ tục</p>
                      </div>
                      <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <p className="mt-3 text-xs text-text-secondary leading-relaxed line-clamp-2">{cat.description}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>



          {/* === Thủ tục thường gặp === */}
          {thuongGap && thuongGap.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-success rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide">Thủ tục thường gặp</h2>
                  <p className="text-sm text-text-muted">Các thủ tục phổ biến nhất tại TTPVHCC</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {thuongGap.map((tt) => (
                  <div key={tt.id} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-white hover:border-success/30 hover:shadow-md btn-transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{tt.name}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{tt.description}</p>
                      <Link href="/thu-tuc" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-success hover:underline">
                        Xem danh sách link DVC
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
