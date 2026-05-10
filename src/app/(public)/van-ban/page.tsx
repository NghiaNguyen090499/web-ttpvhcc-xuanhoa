/**
 * @nhom        : Pages / Văn bản chỉ đạo
 * @chucnang    : Trang đầy đủ danh sách văn bản chỉ đạo điều hành
 * @lienquan    : src/lib/static-data.ts, data/van-ban.json
 * @alias       : van-ban-page, document-directive-page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getVanBanData } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Văn bản chỉ đạo điều hành',
  description: 'Danh sách văn bản chỉ đạo, quyết định, kế hoạch, thông báo do UBND Phường Xuân Hòa ban hành.',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getTypeColor(loai: string): { bg: string; text: string; border: string } {
  switch (loai) {
    case 'Quyết định': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    case 'Kế hoạch': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
    case 'Thông báo': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
    case 'Công văn': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  }
}

export default function VanBanPage() {
  const vanBanList = getVanBanData()
  const sorted = [...vanBanList].sort(
    (a, b) => new Date(b.ngayBanHanh).getTime() - new Date(a.ngayBanHanh).getTime()
  )

  /* Đếm theo loại */
  const countByType = vanBanList.reduce((acc, vb) => {
    acc[vb.loai] = (acc[vb.loai] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Văn bản chỉ đạo</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">Văn bản chỉ đạo điều hành</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Các quyết định, kế hoạch, thông báo, công văn do UBND Phường Xuân Hòa ban hành.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Thống kê theo loại */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Tổng cộng <strong>{vanBanList.length}</strong>
            </span>
            {Object.entries(countByType).map(([loai, count]) => {
              const color = getTypeColor(loai)
              return (
                <span key={loai} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
                  {loai} <strong>{count}</strong>
                </span>
              )
            })}
          </div>

          {/* Danh sách văn bản */}
          <div className="space-y-3">
            {sorted.map((item) => {
              const color = getTypeColor(item.loai)
              return (
                <a
                  key={item.id}
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block bg-white rounded-2xl border ${color.border} hover:shadow-md btn-transition p-5`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <span className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${color.bg} ${color.text} group-hover:scale-105 btn-transition`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary btn-transition leading-relaxed">
                        {item.trichYeu}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs font-bold text-primary">{item.soKyHieu}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color.bg} ${color.text}`}>{item.loai}</span>
                        <span className="text-xs text-text-muted">{formatDate(item.ngayBanHanh)}</span>
                        <span className="text-xs text-text-muted hidden sm:inline">· {item.linhVuc}</span>
                        <span className="text-xs text-text-muted hidden sm:inline">· {item.nguoiKy}</span>
                      </div>
                    </div>

                    {/* Download */}
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0 group-hover:translate-x-0.5 btn-transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </span>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Quay lại */}
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline btn-transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
