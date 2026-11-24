/**
 * @nhom        : Components / Cổng DVC
 * @chucnang    : Thông báo chuyển giao vận hành Cổng DVC Quốc gia (từ 29/05/2026)
 *                — hồ sơ nộp trước thời điểm này tra cứu tại vpcp.dichvucong.gov.vn
 * @lienquan    : src/lib/dvc-links.ts, src/app/(public)/page.tsx, src/components/QuickAccess.tsx
 * @alias       : dvc-transition, thong-bao-dvc
 */

import { DVC_LEGACY_HOME_URL, DVC_PORTAL_URL, DVC_TRANSITION_DATE } from '@/lib/dvc-links'

interface DvcTransitionNoticeProps {
  /** compact: dùng trong form/thẻ nhỏ; mặc định: khối thông báo đầy đủ */
  compact?: boolean
  className?: string
}

export function DvcTransitionNotice({ compact = false, className = '' }: DvcTransitionNoticeProps) {
  if (compact) {
    return (
      <p className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 ${className}`}>
        📢 Từ ngày {DVC_TRANSITION_DATE}, Cổng DVC Quốc gia do Trung tâm Dữ liệu Quốc gia vận hành.
        Hồ sơ nộp <strong>trước</strong> thời điểm này tra cứu tại{' '}
        <a href={DVC_LEGACY_HOME_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-700">
          vpcp.dichvucong.gov.vn
        </a>
        ; hồ sơ nộp từ ngày {DVC_TRANSITION_DATE} tra cứu tại{' '}
        <a href={DVC_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-700">
          dichvucong.gov.vn
        </a>
        .
      </p>
    )
  }

  return (
    <section className={`py-4 ${className}`} aria-labelledby="dvc-transition-title">
      <div className="container-main">
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-start md:p-5">
          <span className="text-2xl leading-none" aria-hidden="true">📢</span>
          <div className="min-w-0 flex-1 text-sm leading-relaxed">
            <h2 id="dvc-transition-title" className="mb-1 font-bold">Thông báo</h2>
            <p>
              Từ ngày {DVC_TRANSITION_DATE}, Cổng Dịch vụ công Quốc gia đã được chuyển sang vận hành bởi
              Trung tâm Dữ liệu Quốc gia.
            </p>
            <p className="mt-1">
              Đối với các hồ sơ đã nộp trước thời điểm này, vui lòng tra cứu thông tin tại địa chỉ:{' '}
              <a
                href={DVC_LEGACY_HOME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-semibold text-primary underline hover:text-primary-dark"
              >
                {DVC_LEGACY_HOME_URL}
              </a>
            </p>
            <p className="mt-1 italic">Xin trân trọng cảm ơn!</p>
          </div>
        </div>
      </div>
    </section>
  )
}
