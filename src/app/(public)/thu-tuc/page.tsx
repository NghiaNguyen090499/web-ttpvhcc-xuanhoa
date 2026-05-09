/**
 * @nhom        : Pages / Thủ tục
 * @chucnang    : Trang danh mục TTHC — search + filter + grid cards + preview ảnh + tải PDF
 * @lienquan    : src/lib/static-data.ts, data/procedures.json
 * @alias       : procedures, thu-tuc
 *
 * Dữ liệu 100% local — ảnh + PDF đã copy từ Canva vào public/
 * Không phụ thuộc Canva CDN hay bất kỳ dịch vụ bên ngoài
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProceduresData } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Thủ tục Hành chính',
  description: 'Tra cứu danh mục thủ tục hành chính thuộc thẩm quyền giải quyết tại TTPVHCC Phường Xuân Hòa, TP.HCM.',
}

export default function ProceduresPage() {
  const data = getProceduresData()
  const categories = data.categories
  const phiDiaGioi = data.phiDiaGioi
  const thuongGap = data.thuongGap

  return (
    <>
      {/* Hero — đỏ */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Tra cứu thủ tục</p>
          <h1 className="mt-2 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Thủ tục Hành chính
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Tra cứu danh mục thủ tục hành chính thuộc thẩm quyền giải quyết của UBND Phường Xuân Hòa.
            Tải PDF danh mục thủ tục theo từng lĩnh vực.
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
                  {/* Ảnh preview nếu có */}
                  {cat.documents && cat.documents[0] && (
                    <div className="relative h-48 overflow-hidden bg-cream">
                      <Image
                        src={cat.documents[0].preview}
                        alt={`Danh mục TTHC ${cat.name}`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        {cat.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-primary hover:bg-white btn-transition"
                            title={`Tải PDF: ${doc.title}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            PDF ({doc.pageCount} trang)
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/thu-tuc/${cat.slug}`} className="block p-5">
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
                    {/* Thumbnail nhỏ */}
                    {tt.preview && (
                      <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={tt.preview}
                          alt={tt.name}
                          fill
                          className="object-cover object-top"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{tt.name}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{tt.description}</p>
                      {tt.pdf && (
                        <a
                          href={tt.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-success hover:underline"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M5 19h14" /></svg>
                          Tải danh mục PDF
                        </a>
                      )}
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
