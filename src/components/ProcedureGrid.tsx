/**
 * @nhom        : Components / Trang chủ
 * @chucnang    : Lưới 6 lĩnh vực TTHC — card logo tròn + tên + nút truy cập (kiểu DVC)
 * @lienquan    : src/lib/static-data.ts, data/procedures.json, public/images/categories/
 * @alias       : procedure-grid, linh-vuc-tthc
 */

import Link from 'next/link'
import Image from 'next/image'
import { getProceduresData } from '@/lib/static-data'

/**
 * @chucnang    : Mapping logo + màu viền cho từng lĩnh vực
 * @lienquan    : public/images/categories/
 */
const CATEGORY_META: Record<string, { logo: string; color: string }> = {
  'linh-vuc-tu-phap': {
    logo: '/images/categories/tu-phap.png',
    color: '#C62828',  // Đỏ đậm — Tư pháp
  },
  'linh-vuc-thanh-tra': {
    logo: '/images/categories/thanh-tra.jpeg',
    color: '#1565C0',  // Xanh dương — Thanh tra
  },
  'linh-vuc-xay-dung': {
    logo: '/images/categories/xay-dung.jpeg',
    color: '#E65100',  // Cam đậm — Xây dựng
  },
  'linh-vuc-y-te': {
    logo: '/images/categories/y-te.png',
    color: '#2E7D32',  // Xanh lá — Y tế
  },
  'linh-vuc-tai-chinh': {
    logo: '/images/categories/tai-chinh.png',
    color: '#0D47A1',  // Xanh-vàng — Tài chính
  },
  'linh-vuc-noi-vu': {
    logo: '/images/categories/noi-vu.png',
    color: '#6A1B9A',  // Tím — Nội vụ
  },
}

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

        {/* Grid — dạng card logo tròn + nút truy cập */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.slug]
            return (
              <Link
                key={cat.name}
                href={`/thu-tuc/${cat.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-border bg-white p-5 md:p-6 hover:shadow-xl hover:-translate-y-1 btn-transition text-center"
              >
                {/* Logo tròn */}
                <div
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] shadow-md group-hover:shadow-lg group-hover:scale-105 btn-transition"
                  style={{ borderColor: meta?.color || 'var(--color-primary)' }}
                >
                  {meta?.logo ? (
                    <Image
                      src={meta.logo}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    /* Fallback — icon SVG */
                    <div className="w-full h-full flex items-center justify-center bg-cream">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Tên lĩnh vực */}
                <h3 className="mt-4 text-sm md:text-base font-bold text-text-primary group-hover:text-primary btn-transition leading-tight">
                  {cat.name}
                </h3>

                {/* Số nhóm thủ tục */}
                <p className="mt-1 text-xs text-text-muted">
                  {cat.subCategories.length} nhóm thủ tục
                </p>

                {/* Nút truy cập dịch vụ */}
                <span
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] md:text-xs font-bold text-white btn-transition group-hover:opacity-90"
                  style={{ backgroundColor: meta?.color || 'var(--color-primary)' }}
                >
                  Truy cập dịch vụ
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
