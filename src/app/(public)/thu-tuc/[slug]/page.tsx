/**
 * @nhom        : Pages / Chi tiết lĩnh vực
 * @chucnang    : Trang chi tiết lĩnh vực TTHC — hiển thị nhóm thủ tục + tài liệu PDF + preview
 * @lienquan    : src/lib/static-data.ts, data/procedures.json
 * @alias       : category-detail, chi-tiet-linh-vuc
 *
 * Dữ liệu 100% local — ảnh + PDF từ public/, không phụ thuộc Canva
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProceduresData, getCategoryBySlug } from '@/lib/static-data'

// Tạo danh sách slug tĩnh cho SSG
export function generateStaticParams() {
  const data = getProceduresData()
  return data.categories.map((cat) => ({ slug: cat.slug }))
}

// SEO metadata động
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return { title: 'Không tìm thấy' }
  return {
    title: `Lĩnh vực ${cat.name}`,
    description: `Thủ tục hành chính lĩnh vực ${cat.name} — ${cat.subCategories.length} nhóm thủ tục tại Phường Xuân Hòa.`,
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  return (
    <>
      {/* Header */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/thu-tuc" className="hover:text-white/90 btn-transition">Thủ tục HC</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">{category.name}</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide mb-2">Lĩnh vực {category.name}</h1>
          <p className="text-sm text-white/70">{category.subCategories.length} nhóm thủ tục — Cấp phường</p>
        </div>
      </section>

      <div className="container-main section-padding">
        {/* === Tài liệu PDF (preview + tải) === */}
        {category.documents && category.documents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Tài liệu thủ tục
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.documents.map((doc, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-lg btn-transition">
                  {/* Preview ảnh */}
                  <div className="relative h-52 overflow-hidden bg-cream">
                    <Image
                      src={doc.preview}
                      alt={doc.title}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Badge loại tài liệu */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      doc.type === 'thuong-gap' ? 'bg-success/90 text-white' :
                      doc.type === 'phi-dia-gioi' ? 'bg-accent/90 text-[#5a3200]' :
                      'bg-primary/90 text-white'
                    }`}>
                      {doc.type === 'thuong-gap' ? 'Thường gặp' :
                       doc.type === 'phi-dia-gioi' ? 'Phi địa giới' : 'Cấp phường'}
                    </span>
                  </div>
                  {/* Info + download */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{doc.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{doc.pageCount} trang</p>
                    <a
                      href={doc.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark btn-transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Tải PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Danh sách nhóm thủ tục === */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Nhóm thủ tục ({category.subCategories.length})
          </h2>
          <div className="space-y-3">
            {category.subCategories.map((sub, idx) => (
              <div key={sub} className={`bg-white rounded-2xl border border-border p-5 hover:-translate-y-0.5 hover:shadow-lg btn-transition animate-fade-in-up stagger-${idx + 1}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{sub}</h3>
                    <p className="text-xs text-text-muted mt-1">Lĩnh vực {category.name} — Cấp phường</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mô tả lĩnh vực */}
        {category.description && (
          <div className="bg-cream rounded-2xl p-6 border border-border mb-6">
            <p className="text-sm text-text-secondary leading-relaxed">{category.description}</p>
          </div>
        )}

        {/* Links DVC */}
        <div className="bg-cream rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-text-primary mb-4">Liên kết hữu ích</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border hover:border-primary/30 btn-transition text-sm">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Tra cứu hồ sơ (DVC Quốc gia)
            </a>
            <a href="https://thutuc.dichvucong.gov.vn/p/home/dvc-tthc-trang-chu.html" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border hover:border-primary/30 btn-transition text-sm">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Thủ tục hành chính (DVC Quốc gia)
            </a>
            <a href="https://drive.google.com/drive/folders/1FHrz0OVdExpG8zpzZ0xQhY82BePZUx1Q" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border hover:border-primary/30 btn-transition text-sm">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải biểu mẫu (Google Drive)
            </a>
            <a href="https://kiosk.hochiminhcity.gov.vn/vi/kiosk/danhgiahcm" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border hover:border-primary/30 btn-transition text-sm">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              Đánh giá dịch vụ công TP.HCM
            </a>
          </div>
        </div>

        {/* Quay lại */}
        <div className="mt-8">
          <Link href="/thu-tuc" className="inline-flex items-center gap-2 text-primary font-medium hover:underline btn-transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            Quay lại danh mục
          </Link>
        </div>
      </div>
    </>
  )
}
