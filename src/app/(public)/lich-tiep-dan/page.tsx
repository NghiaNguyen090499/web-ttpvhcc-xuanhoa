/**
 * @nhom        : Pages / Lịch tiếp công dân
 * @chucnang    : Trang đầy đủ lịch tiếp công dân theo tháng + quy định
 * @lienquan    : src/lib/static-data.ts, data/lich-tiep-dan.json
 * @alias       : lich-tiep-dan-page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getLichTiepDan } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Lịch tiếp công dân',
  description: 'Lịch tiếp công dân định kỳ lãnh đạo UBND Phường Xuân Hòa.',
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isPast(dateStr: string): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

function isToday(dateStr: string): boolean {
  return new Date().toDateString() === new Date(dateStr).toDateString()
}

export default function LichTiepDanPage() {
  const data = getLichTiepDan()
  const sorted = [...data.lichThang].sort((a, b) => new Date(a.ngay).getTime() - new Date(b.ngay).getTime())

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Lịch tiếp công dân</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">Lịch tiếp công dân</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Tháng {data.metadata.thang}/{data.metadata.nam} — Theo Luật Tiếp công dân 2013.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Quy định */}
          <div className="bg-cream/60 border border-border rounded-2xl p-5 md:p-6 mb-8">
            <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Quy định tiếp công dân
            </h2>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>• <strong>Định kỳ:</strong> {data.quyDinh.dinhKy}</p>
              <p>• <strong>Phó Chủ tịch:</strong> {data.quyDinh.phoChutich}</p>
              <p>• <strong>Đột xuất:</strong> {data.quyDinh.dotXuat}</p>
              <p>• <strong>Địa điểm:</strong> {data.quyDinh.diaDiem}</p>
              {data.quyDinh.dienThoai && <p>• <strong>Điện thoại:</strong> {data.quyDinh.dienThoai}</p>}
            </div>
            <p className="mt-3 text-xs text-text-muted italic">Căn cứ: {data.metadata.canCu}</p>
          </div>

          {/* Bảng lịch */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-border overflow-hidden text-sm">
              <thead>
                <tr className="bg-[#1a5c3a] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Ngày</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Buổi</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Người tiếp</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell">Nội dung</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">T.thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((entry, i) => {
                  const past = isPast(entry.ngay)
                  const today = isToday(entry.ngay)
                  return (
                    <tr key={`${entry.ngay}-${i}`} className={`${today ? 'bg-green-50' : past ? 'bg-gray-50 opacity-60' : 'hover:bg-cream/50'} btn-transition`}>
                      <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{formatFullDate(entry.ngay)}</td>
                      <td className="px-4 py-3 text-text-secondary">{entry.buoi}</td>
                      <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{entry.thoiGian}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.nguoiTiep}</td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{entry.noiDung}</td>
                      <td className="px-4 py-3 text-center">
                        {today ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">Hôm nay</span>
                        ) : past ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-500">Đã qua</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">Sắp tới</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Lưu ý */}
          <div className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-200/50">
            <h3 className="text-sm font-bold text-amber-800 mb-2">⚠️ Lưu ý cho công dân</h3>
            <ul className="space-y-1 text-xs text-amber-700">
              <li>• Mang theo CCCD/CMND và giấy tờ liên quan khi đến tiếp dân.</li>
              <li>• Lịch có thể thay đổi đột xuất — vui lòng liên hệ trước.</li>
              <li>• Khiếu nại, tố cáo phải bằng văn bản hoặc trình bày trực tiếp.</li>
            </ul>
          </div>

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
