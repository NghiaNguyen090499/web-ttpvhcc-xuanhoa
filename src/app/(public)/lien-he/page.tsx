/**
 * @nhom        : Pages / Liên hệ
 * @chucnang    : Trang liên hệ — 4 contact cards + bảng lịch 7 ngày + form (kế thừa backup)
 * @lienquan    : src/components/ContactForm.tsx, _backup/src_vite/pages/ContactPage.tsx
 * @alias       : contact, lien-he, phan-anh
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ TTPVHCC Phường Xuân Hòa — địa chỉ, giờ làm việc, form phản ánh kiến nghị trực tuyến.',
}

const SCHEDULE = [
  { day: 'Thứ Hai', morning: '07:30 – 11:30', afternoon: '13:00 – 17:00', active: true },
  { day: 'Thứ Ba', morning: '07:30 – 11:30', afternoon: '13:00 – 17:00', active: true },
  { day: 'Thứ Tư', morning: '07:30 – 11:30', afternoon: '13:00 – 17:00', active: true },
  { day: 'Thứ Năm', morning: '07:30 – 11:30', afternoon: '13:00 – 17:00', active: true },
  { day: 'Thứ Sáu', morning: '07:30 – 11:30', afternoon: '13:00 – 17:00', active: true },
  { day: 'Thứ Bảy', morning: '07:30 – 11:30', afternoon: 'Nghỉ', active: false },
  { day: 'Chủ Nhật', morning: 'Nghỉ', afternoon: 'Nghỉ', active: false },
]

const CONTACTS = [
  { icon: '📞', label: 'Điện thoại', value: '028 3526220', href: 'tel:02835262200' },
  { icon: '✉️', label: 'Email', value: 'xuanhoa@tphcm.gov.vn', href: 'mailto:xuanhoa@tphcm.gov.vn' },
  { icon: '📍', label: 'Địa chỉ', value: '99 Trần Quốc Thảo, P. Xuân Hòa, TP.HCM', href: undefined },
  { icon: '🕐', label: 'Giờ làm việc', value: 'Sáng: 7h30–11h30 | Chiều: 13h00–17h00', href: undefined },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Liên hệ</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Liên hệ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Thông tin liên hệ, lịch làm việc và form phản ánh kiến nghị của UBND Phường Xuân Hòa.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Cột trái: Contact cards + Map + Lịch */}
            <div className="space-y-6">
              {/* 4 contact cards — kế thừa backup */}
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACTS.map((c) => {
                  const inner = (
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-5 hover:bg-cream btn-transition">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-xl">{c.icon}</div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted">{c.label}</p>
                        <p className="mt-1 text-sm font-bold text-text-primary">{c.value}</p>
                      </div>
                    </div>
                  )
                  return c.href
                    ? <a key={c.label} href={c.href}>{inner}</a>
                    : <div key={c.label}>{inner}</div>
                })}
              </div>

              {/* Google My Maps — Bản đồ tùy chỉnh với marker */}
              <div className="overflow-hidden rounded-2xl border border-border">
                <iframe
                  title="Bản đồ UBND Phường Xuân Hòa"
                  src="https://www.google.com/maps/d/u/0/embed?mid=1UUIrmBXAXwRRTm6ihEXdisbRusP2OwI&ll=10.77999210806022,106.69278881827886&z=15"
                  width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Bảng lịch làm việc 7 ngày — kế thừa backup */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="flex items-center gap-2 text-base font-bold text-text-primary">
                  🕐 Lịch làm việc
                </h3>
                <div className="mt-4 overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                        <th className="px-4 py-3 text-center font-semibold">Sáng</th>
                        <th className="px-4 py-3 text-center font-semibold">Chiều</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEDULE.map((row, i) => (
                        <tr key={row.day} className={`${i % 2 === 0 ? 'bg-white' : 'bg-cream'} ${!row.active ? 'text-text-muted' : ''}`}>
                          <td className="px-4 py-3 font-semibold text-text-primary">{row.day}</td>
                          <td className="px-4 py-3 text-center">{row.morning}</td>
                          <td className="px-4 py-3 text-center">{row.afternoon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-text-muted">* Nghỉ các ngày lễ, tết theo quy định của Nhà nước.</p>
              </div>
            </div>

            {/* Cột phải: Form phản ánh */}
            <div className="rounded-2xl border border-border bg-white p-6 md:p-8 h-fit lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-text-primary">Phản ánh - Kiến nghị</h3>
              <p className="mt-2 text-sm text-text-muted">
                Gửi phản ánh, kiến nghị đến UBND Phường Xuân Hòa. Nội dung sẽ được gửi qua email, không lưu trữ dữ liệu cá nhân.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
              <p className="mt-4 text-xs font-semibold leading-relaxed text-text-secondary">
                * Phản ánh sẽ được gửi qua email đến bộ phận tiếp nhận. Theo Luật BVDLCN, chúng tôi không lưu trữ thông tin cá nhân của bạn trong cơ sở dữ liệu.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
