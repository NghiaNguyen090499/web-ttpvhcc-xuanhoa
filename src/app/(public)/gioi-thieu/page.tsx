/**
 * @nhom        : Pages / Giới thiệu
 * @chucnang    : Trang giới thiệu — mission cards + cơ cấu tổ chức (kế thừa backup)
 * @lienquan    : data/ward-info.json, _backup/src_vite/pages/AboutPage.tsx
 * @alias       : about, gioi-thieu
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: 'Giới thiệu Trung tâm Phục vụ Hành chính Công phường Xuân Hòa, TP.HCM — sứ mệnh, chức năng và cơ cấu tổ chức.',
}

const MISSION = [
  { icon: '🎯', title: 'Sứ mệnh', desc: 'Phục vụ nhân dân, giải quyết thủ tục hành chính nhanh chóng, minh bạch, hiệu quả.' },
  { icon: '🛡️', title: 'Cam kết', desc: 'Đảm bảo đúng thời hạn, đúng quy trình, công khai và thuận tiện cho người dân.' },
  { icon: '👥', title: 'Phục vụ', desc: 'Hơn 50,000 lượt giao dịch mỗi năm, phục vụ toàn bộ cư dân phường Xuân Hòa.' },
  { icon: '🏆', title: 'Chất lượng', desc: 'Đạt tiêu chuẩn ISO 9001:2015 trong quản lý chất lượng dịch vụ hành chính công.' },
]

const ORG_CHART = [
  { role: 'Chủ tịch UBND phường', desc: 'Phụ trách chung, điều hành hoạt động UBND phường' },
  { role: 'Phó Chủ tịch UBND phường', desc: 'Phụ trách các lĩnh vực được phân công' },
  { role: 'Công chức Tư pháp – Hộ tịch', desc: 'Đăng ký kết hôn, khai sinh, khai tử, chứng thực' },
  { role: 'Công chức Địa chính – Xây dựng', desc: 'Quản lý đất đai, cấp phép xây dựng' },
  { role: 'Công chức Văn hóa – Xã hội', desc: 'Lao động, thương binh, xã hội, y tế, giáo dục' },
  { role: 'Bộ phận Tiếp nhận và Trả kết quả', desc: 'Tiếp nhận, xử lý, trả kết quả TTHC' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Giới thiệu</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Giới thiệu TTPVHCC
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Trung tâm Phục vụ Hành chính Công phường Xuân Hòa – nơi tiếp nhận, giải quyết thủ tục hành chính và phục vụ người dân.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main space-y-12">
          {/* Mission cards — 4 cột */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MISSION.map((m) => (
              <div key={m.title} className="rounded-2xl border border-border bg-white p-6 text-center hover:-translate-y-0.5 hover:shadow-lg btn-transition">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-2xl">
                  {m.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-text-primary">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Chức năng nhiệm vụ — kế thừa backup */}
          <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-primary text-lg">🏛️</div>
              <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide">Chức năng & Nhiệm vụ</h2>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
              <p>
                Trung tâm Phục vụ Hành chính Công (TTPVHCC) phường Xuân Hòa là đơn vị trực thuộc UBND phường,
                có chức năng tiếp nhận và giải quyết thủ tục hành chính cho người dân và doanh nghiệp trên địa bàn.
              </p>
              <p><strong className="text-text-primary">Nhiệm vụ chính:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tiếp nhận, thẩm định và trả kết quả thủ tục hành chính theo cơ chế một cửa, một cửa liên thông</li>
                <li>Hướng dẫn, hỗ trợ người dân và doanh nghiệp trong quá trình thực hiện thủ tục hành chính</li>
                <li>Phối hợp với các cơ quan, đơn vị liên quan trong giải quyết thủ tục hành chính</li>
                <li>Tiếp nhận phản ánh, kiến nghị của người dân về thủ tục hành chính</li>
                <li>Thực hiện chuyển đổi số, ứng dụng công nghệ thông tin trong giải quyết TTHC</li>
              </ul>
            </div>
          </div>

          {/* Cơ cấu tổ chức — kế thừa backup */}
          <div>
            <h2 className="text-xl font-bold text-text-primary font-heading uppercase tracking-wide mb-6">
              Cơ cấu tổ chức
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ORG_CHART.map((item, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white p-5 hover:shadow-md btn-transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-text-primary">{item.role}</h3>
                  <p className="mt-1 text-xs text-text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
