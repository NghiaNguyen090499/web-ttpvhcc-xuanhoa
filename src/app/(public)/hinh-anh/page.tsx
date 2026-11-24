/**
 * @nhom        : Pages / Hình ảnh
 * @chucnang    : Trang danh sách toàn bộ hình ảnh từ CMS tuyên truyền
 * @lienquan    : src/lib/portal-db.ts, src/components/HomeContentLayout.tsx
 * @alias       : hinh-anh, thu-vien-anh, propaganda-images
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { ImageGalleryModal } from '@/components/ImageGalleryModal'
import { getPortalTuyenTruyenData } from '@/lib/portal-db'
import { isPropagandaImage } from '@/lib/propaganda-media'
import { notFound } from 'next/navigation'
import { Pagination, PageRangeInfo } from '@/components/Pagination'
import { paginate, parsePage, type PageSearchParams } from '@/lib/pagination'

export const metadata: Metadata = {
  title: 'Hình ảnh tuyên truyền',
  description: 'Tổng hợp hình ảnh tuyên truyền, hoạt động và nội dung hỗ trợ người dân tại TTPVHCC Phường Xuân Hòa.',
}

export const revalidate = 60

export default async function ImageGalleryPage({ searchParams }: { searchParams: PageSearchParams }) {
  const items = await getPortalTuyenTruyenData()
  const { items: images, page, totalPages, total, offset, outOfRange } = paginate(items.filter(isPropagandaImage), parsePage((await searchParams).page))
  if (outOfRange) notFound()

  return (
    <>
      <section className="hero-gradient px-4 py-12 text-white md:py-16">
        <div className="container-main">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Trang chủ
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Hình ảnh tuyên truyền
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Xem lại hình ảnh tuyên truyền, hoạt động chuyển đổi số và nội dung hỗ trợ người dân.
          </p>
        </div>
      </section>

      <section className="bg-[radial-gradient(#d8e7f2_1.2px,transparent_1.2px)] [background-size:22px_22px] py-10 md:py-14">
        <div className="container-main">
          {total === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <ImageIcon className="h-14 w-14 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-text-primary">Chưa có hình ảnh</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                Hình ảnh sẽ xuất hiện tại đây sau khi cán bộ cập nhật trong hệ thống quản trị.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5"><PageRangeInfo offset={offset} count={images.length} total={total} unit="hình ảnh" /></div>
              <ImageGalleryModal key={page} items={images} />
              <Pagination currentPage={page} totalPages={totalPages} basePath="/hinh-anh" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
