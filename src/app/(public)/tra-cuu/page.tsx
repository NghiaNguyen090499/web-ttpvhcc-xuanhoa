/**
 * @nhom        : Pages / Tra cứu
 * @chucnang    : Trang tra cứu & đánh giá hồ sơ — embed iframe Kiosk TP.HCM
 * @lienquan    : kiosk.hochiminhcity.gov.vn
 * @alias       : tra-cuu, kiosk, danh-gia
 *
 * Các chức năng: Tra cứu hồ sơ, Tra cứu thủ tục, Đánh giá dịch vụ, Hướng dẫn công dân
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tra cứu & Đánh giá hồ sơ',
  description: 'Tra cứu tình trạng hồ sơ, thủ tục hành chính và đánh giá dịch vụ công tại TP.HCM — Kiosk điện tử.',
}

// Danh sách chức năng tra cứu
const KIOSK_FEATURES = [
  {
    id: 'tra-cuu-ho-so',
    title: 'Tra cứu hồ sơ',
    description: 'Theo dõi tình trạng xử lý hồ sơ đã nộp. Nhập mã hồ sơ hoặc mã biên nhận để tra cứu.',
    url: 'https://kiosk.hochiminhcity.gov.vn/vi/kiosk/tracuuhoso',
    icon: '🔍',
    color: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50 border-blue-200',
    lightText: 'text-blue-700',
  },
  {
    id: 'tra-cuu-thu-tuc',
    title: 'Tra cứu thủ tục',
    description: 'Tìm kiếm thủ tục hành chính theo tên, mã số hoặc lĩnh vực. Xem hồ sơ cần thiết và quy trình.',
    url: 'https://kiosk.hochiminhcity.gov.vn/vi/kiosk/tracuu_thutuc',
    icon: '📋',
    color: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50 border-emerald-200',
    lightText: 'text-emerald-700',
  },
  {
    id: 'danh-gia-dvc',
    title: 'Đánh giá dịch vụ công',
    description: 'Đánh giá chất lượng phục vụ tại các cơ quan hành chính TP.HCM — góp phần cải thiện dịch vụ.',
    url: 'https://kiosk.hochiminhcity.gov.vn/vi/kiosk/danhgiahcm',
    icon: '⭐',
    color: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50 border-amber-200',
    lightText: 'text-amber-700',
  },
  {
    id: 'huong-dan',
    title: 'Hướng dẫn công dân',
    description: 'Hướng dẫn sử dụng Cổng Dịch vụ công, cách nộp hồ sơ trực tuyến và quy trình xử lý.',
    url: 'https://kiosk.hochiminhcity.gov.vn/vi/kiosk/support/huongdan_congdan',
    icon: '📖',
    color: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50 border-purple-200',
    lightText: 'text-purple-700',
  },
]

export default function TraCuuPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Tra cứu & Đánh giá</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Tra cứu & Đánh giá hồ sơ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Tra cứu tình trạng hồ sơ, thủ tục hành chính và đánh giá chất lượng dịch vụ công tại TP. Hồ Chí Minh.
          </p>
        </div>
      </section>

      {/* Grid chức năng */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KIOSK_FEATURES.map((feat) => (
              <a
                key={feat.id}
                href={feat.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative rounded-2xl border overflow-hidden ${feat.lightBg} hover:shadow-xl hover:-translate-y-1 btn-transition`}
                id={`kiosk-${feat.id}`}
              >
                {/* Gradient bar trên cùng */}
                <div className={`h-1.5 bg-gradient-to-r ${feat.color}`} />

                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 btn-transition">
                      <span className="text-3xl">{feat.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg font-bold ${feat.lightText} mb-1`}>{feat.title}</h2>
                      <p className="text-sm text-text-secondary leading-relaxed">{feat.description}</p>

                      {/* CTA */}
                      <span className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${feat.lightText} group-hover:underline`}>
                        Truy cập ngay
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 btn-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Kiosk tổng quan */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🖥️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Kiosk điện tử TP.HCM</h3>
                <p className="text-sm text-white/80">Hệ thống tổng hợp tra cứu, đánh giá dịch vụ hành chính công TP. Hồ Chí Minh</p>
              </div>
              <a
                href="https://kiosk.hochiminhcity.gov.vn/vi/kiosk/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary text-sm font-bold rounded-xl hover:bg-white/90 btn-transition shrink-0"
              >
                🌐 Truy cập Kiosk
              </a>
            </div>
          </div>

          {/* Hướng dẫn nhanh */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-cream p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                <h4 className="font-semibold text-text-primary text-sm">Nộp hồ sơ</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Nộp hồ sơ trực tiếp tại TTPVHCC hoặc trực tuyến qua Cổng DVC. Nhận mã biên nhận sau khi nộp.
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                <h4 className="font-semibold text-text-primary text-sm">Tra cứu</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Nhập mã biên nhận hoặc số CMND/CCCD để theo dõi tiến độ xử lý hồ sơ theo thời gian thực.
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
                <h4 className="font-semibold text-text-primary text-sm">Đánh giá</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Sau khi nhận kết quả, đánh giá mức độ hài lòng để giúp nâng cao chất lượng dịch vụ công.
              </p>
            </div>
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
