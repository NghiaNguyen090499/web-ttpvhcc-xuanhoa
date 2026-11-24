/**
 * @nhom        : Pages / Lịch công tác
 * @chucnang    : Trang đầy đủ lịch công tác tuần — bảng chi tiết theo ngày
 * @lienquan    : src/lib/portal-db.ts, data/lich-cong-tac.json fallback
 * @alias       : lich-cong-tac-page, work-schedule-page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getPortalLichCongTac } from '@/lib/portal-db'
import { formatWorkScheduleFileSize } from '@/lib/work-schedule-file'

export const metadata: Metadata = {
  title: 'Lịch công tác tuần',
  description: 'Lịch công tác tuần của lãnh đạo UBND Phường Xuân Hòa — thời gian, nội dung, chủ trì, địa điểm.',
}

/**
 * @chucnang    : Format ngày từ ISO sang DD/MM/YYYY
 * @input       : dateStr (string)
 * @output      : string
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCompactDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function LichCongTacPage() {
  const data = await getPortalLichCongTac()
  const scheduleFile = data.metadata.file
  const dutySchedule = data.lichTruc || []
  const hasDutySchedule = dutySchedule.length > 0

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/90 btn-transition">Trang chủ</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90">Lịch công tác</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Lịch công tác tuần
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Lịch làm việc của lãnh đạo UBND Phường Xuân Hòa — cập nhật hàng tuần.
          </p>
          {data.metadata.tuanSo > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                Tuần {data.metadata.tuanSo}: {new Date(data.metadata.tuanTu).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} — {new Date(data.metadata.tuanDen).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Nội dung lịch */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Thông tin cập nhật */}
          <div className="flex items-center gap-2 mb-6 text-xs text-text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cập nhật: {formatDate(data.metadata.capNhat)} · {data.metadata.nguoiDuyet}
          </div>

          {scheduleFile && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v6h5M9 16h6M9 12h3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Bản PDF lịch công tác chính thức</p>
                    <h2 className="mt-1 text-lg font-bold text-text-primary">{scheduleFile.title}</h2>
                    <p className="mt-1 break-all text-sm text-text-muted">{scheduleFile.fileName}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatWorkScheduleFileSize(scheduleFile.fileSize)}
                      {scheduleFile.fileSize ? ' · ' : ''}
                      Cập nhật file: {formatDateTime(scheduleFile.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    href={scheduleFile.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm font-bold text-primary btn-transition hover:bg-cream"
                  >
                    Mở PDF
                  </a>
                  <a
                    href={scheduleFile.fileUrl}
                    download={scheduleFile.fileName}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white btn-transition hover:bg-primary-dark"
                  >
                    Tải về
                  </a>
                </div>
              </div>

              <div className="hidden h-[720px] border-t border-border bg-gray-50 lg:block">
                <iframe
                  title={scheduleFile.title}
                  src={`${scheduleFile.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
                  className="h-full w-full"
                />
              </div>
              <div className="border-t border-border bg-cream/40 p-4 text-sm text-text-secondary lg:hidden">
                Màn hình nhỏ nên bản PDF được mở bằng nút “Mở PDF” hoặc “Tải về” phía trên.
              </div>
            </div>
          )}

          {hasDutySchedule ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border bg-primary px-5 py-4 text-white">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
                  Lịch tiếp nhận và giải quyết hồ sơ hành chính
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  Của Ban Giám đốc Trung tâm Phục vụ Hành chính Công
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="bg-cream text-xs font-bold uppercase tracking-wide text-text-secondary">
                      <th className="w-44 px-5 py-3 text-left">Ngày</th>
                      <th className="w-72 px-5 py-3 text-left">Lãnh đạo trực</th>
                      <th className="px-5 py-3 text-left">Nội dung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dutySchedule.map((item) => {
                      return (
                        <tr key={item.ngay} className="bg-white">
                          <td className="px-5 py-4 align-top">
                            <p className="font-bold text-text-primary">{item.thu}</p>
                            <p className="mt-1 text-text-muted">{formatCompactDate(item.ngay)}</p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            {item.lanhDaoTruc ? (
                              <>
                                <p className="font-bold text-text-primary">{item.lanhDaoTruc}</p>
                                <p className="mt-1 text-sm text-text-secondary">{item.chucVu}</p>
                              </>
                            ) : (
                              <p className="text-text-muted">Không có lịch trực</p>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top text-text-primary">
                            {item.noiDung || <span className="text-text-muted">-</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : data.lichTuan.length > 0 ? (
            <div className="space-y-4">
              {data.lichTuan.map((ngay) => {
                return (
                  <div
                    key={ngay.ngay}
                    className="overflow-hidden rounded-2xl border border-border bg-white"
                  >
                    <div className="flex items-center gap-3 bg-cream px-5 py-3">
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
                        {ngay.thu}
                      </h3>
                      <span className="text-xs font-medium text-text-muted">
                        {formatDate(ngay.ngay)}
                      </span>
                    </div>

                    <div className="divide-y divide-border/50">
                      {ngay.items.map((item, i) => (
                        <div key={i} className="px-5 py-4 flex flex-col md:flex-row md:items-start gap-3">
                          <div className="flex items-center gap-2 md:w-36 shrink-0">
                            <svg className="w-4 h-4 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-primary">
                              {item.thoiGian}
                            </span>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm text-text-primary leading-relaxed">
                              {item.noiDung}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                {item.chuTri}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                {item.diaDiem}
                              </span>
                              {item.ghiChu && (
                                <span className="text-xs text-amber-600 italic">
                                  📌 {item.ghiChu}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
              Nội dung lịch chi tiết được cập nhật trong file PDF phía trên.
            </div>
          )}

          {/* Ghi chú */}
          <div className="mt-8 p-5 bg-cream/50 rounded-2xl border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-2">Ghi chú</h3>
            <ul className="space-y-1 text-xs text-text-secondary">
              {(data.metadata.gioLamViec || [
                'Lịch có thể thay đổi do yêu cầu công tác đột xuất.',
                'Liên hệ Văn phòng UBND Phường để biết thêm chi tiết.',
              ]).map((note) => (
                <li key={note}>• {note}</li>
              ))}
              {(data.metadata.diaDiemTruSo || []).map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
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
