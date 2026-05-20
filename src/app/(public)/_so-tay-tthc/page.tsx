/**
 * @nhom        : Pages / Sổ tay TTHC
 * @chucnang    : Trang nhúng AppSheet Sổ tay Thủ tục Hành chính Công 2026
 *                Hiển thị ứng dụng AppSheet qua iframe — danh sách văn bản PDF,
 *                xem nội dung PDF, QR code, nút nộp hồ sơ
 * @input       : Không có tham số đầu vào
 * @output      : Trang React Server Component
 * @lienquan    : src/app/(public)/layout.tsx, src/app/(public)/thu-tuc/page.tsx
 * @alias       : so-tay-tthc, handbook, appsheet-embed
 */

import type { Metadata } from 'next'
import Link from 'next/link'

/* URL ứng dụng AppSheet — Sổ tay TTHC 2026 */
const APPSHEET_URL =
  'https://www.appsheet.com/start/d6e20829-a9a4-464b-b086-91e120cb8d1c'

/* SEO metadata (siêu dữ liệu) cho trang */
export const metadata: Metadata = {
  title: 'Sổ tay Thủ tục Hành chính Công 2026 | TTPVHCC Xuân Hòa',
  description:
    'Tra cứu sổ tay thủ tục hành chính công năm 2026 — danh sách văn bản, biểu mẫu PDF, QR code nộp hồ sơ trực tuyến.',
}

export default function SoTayTTHCPage() {
  return (
    <section className="flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* ── Breadcrumb + Tiêu đề ─────────────────────────── */}
      <div className="bg-white/70 border-b border-border backdrop-blur-sm">
        <div className="container-main py-4">
          {/* Breadcrumb (thanh điều hướng phụ) */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
            <Link
              href="/"
              className="hover:text-primary btn-transition"
            >
              Trang chủ
            </Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text-primary font-medium">
              Sổ tay TTHC 2026
            </span>
          </nav>

          {/* Tiêu đề trang */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary font-heading uppercase tracking-wide">
                📖 Sổ tay Thủ tục Hành chính Công 2026
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Tra cứu văn bản, biểu mẫu và nộp hồ sơ trực tuyến
              </p>
            </div>

            {/* Nút mở rộng — mở AppSheet tab mới */}
            <a
              href={APPSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark btn-transition shadow-sm self-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Mở rộng
            </a>
          </div>
        </div>
      </div>

      {/* ── Iframe nhúng AppSheet ─────────────────────────── */}
      <div className="flex-1 relative">
        {/* Loading placeholder — hiển thị khi iframe đang tải */}
        <div className="absolute inset-0 flex items-center justify-center bg-surface z-0">
          <div className="text-center animate-fade-in">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-text-muted">Đang tải Sổ tay TTHC...</p>
          </div>
        </div>

        {/* Iframe chính — chiếm toàn bộ vùng nội dung */}
        <iframe
          src={APPSHEET_URL}
          title="Sổ tay Thủ tục Hành chính Công 2026"
          className="relative z-10 w-full border-0"
          style={{ height: 'calc(100vh - 80px)', minHeight: '700px' }}
          allow="clipboard-write; fullscreen"
          loading="lazy"
        />
      </div>
    </section>
  )
}
