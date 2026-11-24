import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Camera, Clock3, Footprints, MapPinned, Sparkles, UtensilsCrossed } from 'lucide-react'
import { FEATURED_JOURNEYS, FEATURED_PLACES, FEATURED_PLACE_CATEGORIES } from '../../../../data/featured-places'
import { FeaturedPlacesExplorer } from '@/components/FeaturedPlacesExplorer'
import { FeaturedJourneys } from '@/components/FeaturedJourneys'

export const metadata: Metadata = {
  title: 'Khám phá Xuân Hòa',
  description: 'Bản đồ các địa điểm, địa danh, di sản và tiện ích công nổi bật tại phường Xuân Hòa, Thành phố Hồ Chí Minh.',
}

export default function FeaturedPlacesPage() {
  const visualPlaces = FEATURED_PLACES.filter((place) => place.image).slice(0, 4)
  const heroPlace = visualPlaces[0]

  return (
    <>
      <section
        className="relative isolate min-h-[640px] overflow-hidden bg-[#0b3048] px-4 py-14 text-white md:flex md:min-h-[720px] md:items-center md:py-24"
        style={heroPlace?.image ? {
          backgroundImage: `linear-gradient(90deg, rgba(5, 26, 39, 0.98) 0%, rgba(8, 42, 61, 0.88) 48%, rgba(8, 42, 61, 0.28) 100%), url("${heroPlace.image.src.replace(/"/g, '\\"')}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_28%,rgba(244,197,66,0.24),transparent_22%),radial-gradient(circle_at_62%_80%,rgba(37,167,223,0.16),transparent_26%)]" />
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/15" />
        <div className="container-main relative w-full">
          <nav className="flex items-center gap-2 text-xs text-white/65" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white btn-transition">Trang chủ</Link>
            <ChevronRightIcon />
            <span className="text-white/90">Khám phá Xuân Hòa</span>
          </nav>
          <p className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#f2c35d] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Bản đồ ký ức sống
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-5xl font-bold uppercase leading-[0.98] tracking-wide md:text-7xl">
            Một phường.<br />Nhiều lớp thời gian.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
            Đi qua Xuân Hòa bằng những hành trình được dẫn dắt bởi ký ức, kiến trúc và đời sống văn hóa — mỗi điểm dừng là một câu chuyện còn hiện diện giữa lòng thành phố.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#hanh-trinh-xuan-hoa" className="inline-flex items-center gap-2 rounded-xl bg-[#f2c35d] px-5 py-3.5 text-sm font-extrabold text-[#3b2a0d] shadow-xl shadow-black/20 transition hover:bg-[#ffdc87]">
              Chọn hành trình của bạn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#ban-do-xuan-hoa" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/18">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Tra cứu bản đồ
            </a>
          </div>

          <div className="mt-10 flex max-w-2xl flex-wrap gap-x-7 gap-y-3 border-t border-white/18 pt-5 text-xs font-semibold text-white/68">
            <span className="inline-flex items-center gap-2"><Footprints className="h-4 w-4 text-[#f2c35d]" aria-hidden="true" />{FEATURED_JOURNEYS.length} hành trình gợi ý</span>
            <span className="inline-flex items-center gap-2"><MapPinned className="h-4 w-4 text-[#f2c35d]" aria-hidden="true" />{FEATURED_PLACES.length} điểm trên bản đồ số</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f2c35d]" aria-hidden="true" />Chọn theo quỹ thời gian</span>
          </div>
          {heroPlace?.image && (
            <a
              href={heroPlace.image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-fit items-center gap-1.5 text-xs text-white/65 hover:text-white"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              Ảnh {heroPlace.name}: {heroPlace.image.attribution} · {heroPlace.image.license}
            </a>
          )}
        </div>
      </section>

      <FeaturedJourneys journeys={FEATURED_JOURNEYS} />

      <section className="overflow-hidden bg-[#102f29] py-10 text-white md:py-14">
        <div className="container-main">
          <Link href="/dia-diem-noi-bat/am-thuc" className="group relative grid overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_85%_25%,rgba(239,198,116,0.24),transparent_24%)] p-6 transition hover:border-[#efc674]/45 md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:p-9">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#efc674]">
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                Trải nghiệm mới
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase leading-tight md:text-4xl">Ăn gì ở Xuân Hòa?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                Tìm quán ăn, cà phê và những hương vị quanh phường — có ảnh trực quan, mô tả được biên tập và mở vị trí ngay trên Google Maps.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#efc674] px-4 py-3 text-sm font-extrabold text-[#3d2c13] transition group-hover:bg-[#ffdc8b]">
                Khám phá bản đồ vị ngon
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
            <div className="relative mt-7 flex min-h-40 items-center justify-center md:mt-0">
              <div className="absolute h-44 w-44 rounded-full border border-[#efc674]/25" />
              <div className="absolute h-32 w-32 rotate-12 rounded-[34%] bg-white/6" />
              <UtensilsCrossed className="relative h-20 w-20 text-[#efc674] transition duration-500 group-hover:rotate-6 group-hover:scale-110" aria-hidden="true" />
              <span className="absolute right-[12%] top-[8%] inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#765000] shadow-lg">
                <Camera className="h-3.5 w-3.5 text-[#a15c2f]" aria-hidden="true" />
                Ảnh + bản đồ
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="container-main">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Những lớp ký ức</p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-wide text-text-primary md:text-3xl">
              Chạm vào câu chuyện bằng hình ảnh thật
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
              Mỗi bức ảnh mở ra một lát cắt về đời sống, kiến trúc và ký ức đô thị. Ảnh hiển thị có nguồn và giấy phép rõ ràng; các ảnh tư liệu địa phương sẽ được bổ sung sau khi xác thực.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {visualPlaces.map((place) => {
              const category = FEATURED_PLACE_CATEGORIES[place.category]
              return (
                <article key={place.id} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_20px_36px_rgba(15,23,42,0.12)]">
                  {place.image && (
                    <div
                      role="img"
                      aria-label={place.image.alt}
                      className="relative aspect-[4/3] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url("${place.image.src.replace(/"/g, '\\"')}")` }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-12">
                        <a href={place.image.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-white/80 hover:text-white">
                          Ảnh: {place.image.attribution} · {place.image.license}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${category.color}`}>{category.label}</span>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-text-primary group-hover:text-primary">{place.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{place.summary}</p>
                    <a href="#ban-do-xuan-hoa" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark">
                      Khám phá trên bản đồ
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <FeaturedPlacesExplorer places={FEATURED_PLACES} />

      <section className="bg-white py-10 md:py-14">
        <div className="container-main grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-primary/15 bg-primary-50 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Dữ liệu địa điểm</p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">Luôn ưu tiên thông tin chính xác, dễ sử dụng</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
              Dữ liệu hiện gồm 19 điểm khám phá – di sản, 6 tiện ích và trụ sở công, 12 khu vực bỏ phiếu cùng lớp ranh giới 24 khu phố. Nội dung chuyên sâu tiếp tục được bổ sung sau khi có tư liệu và xác nhận từ đơn vị phụ trách.
            </p>
          </div>
          <Link href="/lien-he" className="group flex items-center justify-between gap-4 rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/15 transition hover:bg-primary-dark">
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Cần hỗ trợ?</span>
              <span className="mt-2 block text-lg font-bold">Liên hệ phường Xuân Hòa</span>
              <span className="mt-1 block text-sm text-white/75">Gửi phản ánh hoặc góp ý về địa điểm.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
    </svg>
  )
}
