/**
 * @nhom        : Pages / Đặt lịch tại nhà
 * @chucnang    : Trang tạm "Sắp ra mắt" cho dịch vụ đặt lịch tại nhà
 * @lienquan    : src/components/HomeContentLayout.tsx
 * @alias       : dat-lich-tai-nha, coming-soon
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Đặt lịch tại nhà — Sắp ra mắt',
  description: 'Dịch vụ đặt lịch tại nhà của Trung tâm Phục vụ Hành chính công phường Xuân Hòa sắp ra mắt.',
}

export default function DatLichTaiNhaPage() {
  return (
    <section className="flex min-h-[60vh] items-center py-16 md:py-24">
      <div className="container-main">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarClock className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-dark">Sắp ra mắt</p>
          <h1 className="mt-2 font-heading text-2xl font-bold uppercase text-text-primary md:text-3xl">
            Đặt lịch tại nhà
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Dịch vụ đang được xây dựng và sẽ sớm ra mắt. Trong thời gian này, vui lòng đến trực tiếp Trung tâm để được hỗ trợ.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
