/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Lưới 6 lĩnh vực TTHC — tông đỏ + kem, bo tròn 2xl
 * @lienquan    : src/lib/static-data.ts, data/procedures.json
 * @alias       : procedure-grid, linh-vuc-tthc
 */

import Link from 'next/link'
import { getProceduresData } from '@/lib/static-data'

export function ProcedureGrid() {
  const data = getProceduresData()
  const categories = data.categories

  return (
    <section className="py-10 md:py-14" id="procedure-grid">
      <div className="container-main">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tra cứu nhanh</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-text-primary font-heading uppercase tracking-wide">
            Lĩnh vực Thủ tục Hành chính
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-3 rounded-full" />
          <p className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
            6 lĩnh vực thủ tục hành chính cấp phường — tra cứu nhanh theo lĩnh vực
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/thu-tuc/${cat.slug}`}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg btn-transition">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-primary group-hover:bg-primary group-hover:text-white btn-transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary btn-transition">{cat.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{cat.subCategories.length} nhóm thủ tục</p>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {cat.subCategories.slice(0, 2).map((g) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 bg-cream rounded-full text-text-secondary font-medium">{g}</span>
                  ))}
                  {cat.subCategories.length > 2 && (
                    <span className="text-[10px] px-2 py-0.5 bg-cream rounded-full text-primary font-semibold">+{cat.subCategories.length - 2}</span>
                  )}
                </div>
              </div>
              {/* Arrow */}
              <svg className="w-5 h-5 text-text-muted group-hover:text-primary btn-transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
