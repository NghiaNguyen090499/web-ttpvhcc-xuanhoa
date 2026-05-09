/**
 * @nhom        : Components / Layout
 * @chucnang    : Footer — tông đỏ đậm, nền ấm
 * @lienquan    : src/app/(public)/layout.tsx
 * @alias       : footer
 */

import Link from 'next/link'

export function Footer() {
  const yr = new Date().getFullYear()
  return (
    <footer className="bg-primary-dark text-white" role="contentinfo">
      <div className="container-main section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <h3 className="text-base font-bold mb-4 text-accent font-heading uppercase tracking-wide">TTPVHCC Phường Xuân Hòa</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>99 Trần Quốc Thảo, Phường Xuân Hòa, TP.HCM</li>
              <li className="flex gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><a href="tel:02835262200" className="hover:text-white btn-transition">028 3526220</a></li>
              <li className="flex gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><a href="mailto:xuanhoa@tphcm.gov.vn" className="hover:text-white btn-transition">xuanhoa@tphcm.gov.vn</a></li>
              <li className="flex gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div><p>T2–T6: 07:30 – 11:30, 13:00 – 17:00</p><p>T7: 07:30 – 11:30 (sáng)</p></div></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-bold mb-4 text-accent font-heading uppercase tracking-wide">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/thu-tuc" className="text-white/80 hover:text-white btn-transition">Thủ tục hành chính</Link></li>
              <li><Link href="/tra-cuu" className="text-white/80 hover:text-white btn-transition">Tra cứu & Đánh giá</Link></li>
              <li><Link href="/tin-tuc" className="text-white/80 hover:text-white btn-transition">Tin tức - Thông báo</Link></li>
              <li><Link href="/niem-yet" className="text-white/80 hover:text-white btn-transition">Niêm yết công khai</Link></li>
              <li><Link href="/gioi-thieu" className="text-white/80 hover:text-white btn-transition">Giới thiệu</Link></li>
              <li><Link href="/lien-he" className="text-white/80 hover:text-white btn-transition">Liên hệ - Phản ánh</Link></li>
              <li><Link href="/lien-ket" className="text-white/80 hover:text-white btn-transition">Liên kết website</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-bold mb-4 text-accent font-heading uppercase tracking-wide">Cổng Dịch vụ công</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white btn-transition">Cổng DVC Quốc gia ↗</a></li>
              <li><a href="https://dichvucong.hochiminhcity.gov.vn" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white btn-transition">Cổng DVC TP.HCM ↗</a></li>
              <li><a href="https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white btn-transition">Tra cứu hồ sơ ↗</a></li>
              <li><a href="https://www.facebook.com/phuongxuanhoatphochiminh" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white btn-transition">Facebook chính thức ↗</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-main py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <p>© {yr} UBND Phường Xuân Hòa. Bản quyền thuộc UBND Phường Xuân Hòa, TP.HCM.</p>
          <p>Phiên bản 1.0 — ARAR</p>
        </div>
      </div>
    </footer>
  )
}
