import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  Coffee,
  MapPinned,
  Route,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { FEATURED_JOURNEYS, FEATURED_PLACES } from '../../data/featured-places'
import { FOOD_CATEGORY_VISUALS } from '@/lib/food-category-visuals'
import { getFoodPlacesContent } from '@/lib/food-places'

function safeBackgroundUrl(value: string) {
  return value.replace(/"/g, '\\"')
}

export async function HomeExploreXuanHoa() {
  const foodContent = await getFoodPlacesContent()
  const activeFoodPlaces = foodContent.items.filter((item) => item.isActive)
  const foodCounts = activeFoodPlaces.reduce<Record<string, number>>((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1
    return counts
  }, {})
  const placeCover = FEATURED_PLACES.find((place) => place.id === 'chua-xa-loi')?.image
    || FEATURED_PLACES.find((place) => place.image)?.image
  const foodCover = FOOD_CATEGORY_VISUALS.restaurant

  const foodCategories = [
    { key: 'restaurant', label: 'Quán ăn', count: foodCounts.restaurant || 0, icon: UtensilsCrossed },
    { key: 'cafe', label: 'Cà phê', count: foodCounts.cafe || 0, icon: Coffee },
    { key: 'bakery', label: 'Tiệm bánh', count: foodCounts.bakery || 0, icon: Store },
  ]

  return (
    <section id="kham-pha-xuan-hoa" className="relative overflow-hidden bg-[#f4efe5] py-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(81,59,31,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(81,59,31,0.055)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="container-main relative">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98522e]">
              <span className="h-px w-8 bg-[#98522e]" />
              Khám phá Xuân Hòa
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold uppercase leading-[1.1] tracking-wide text-[#17334b] md:text-5xl">
              Đi một vòng.<br className="hidden sm:block" /> Nếm một vị.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d6d78] md:text-base">
              Tìm hiểu địa danh, chọn một hành trình theo quỹ thời gian hoặc mở bản đồ vị ngon để cảm nhận Xuân Hòa bằng cả câu chuyện và đời sống thường ngày.
            </p>
          </div>
          <Link
            href="/dia-diem-noi-bat"
            className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-[#17334b] transition hover:text-[#98522e]"
          >
            Mở không gian khám phá
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <article className="group relative isolate min-h-[480px] overflow-hidden rounded-[30px] bg-[#0b3048] text-white shadow-[0_28px_60px_-34px_rgba(23,51,75,0.72)] md:min-h-[530px]">
            {placeCover && (
              <div
                role="img"
                aria-label={placeCover.alt}
                className="absolute inset-0 -z-30 bg-cover bg-center transition duration-700 group-hover:scale-[1.035]"
                style={{ backgroundImage: `url("${safeBackgroundUrl(placeCover.src)}")` }}
              />
            )}
            <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#061a27] via-[#0b3048]/78 to-[#0b3048]/12" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_12%,rgba(242,195,93,0.24),transparent_30%)]" />

            <div className="flex min-h-[480px] flex-col justify-between p-7 md:min-h-[530px] md:p-10">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.17em] backdrop-blur">
                  <MapPinned className="h-3.5 w-3.5 text-[#f2c35d]" aria-hidden="true" />
                  Địa điểm & hành trình
                </span>
                <span className="font-heading text-6xl font-bold text-white/25">01</span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f2c35d]">Bản đồ ký ức sống</p>
                <h3 className="mt-4 max-w-2xl font-heading text-4xl font-bold uppercase leading-[1.1] tracking-wide md:text-5xl">
                  Một phường.<br />Nhiều lớp thời gian.
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 md:text-base">
                  Khám phá di sản, kiến trúc, không gian văn hóa và những địa chỉ phục vụ người dân qua bản đồ tương tác cùng các tuyến đi có câu chuyện.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                    <MapPinned className="h-3.5 w-3.5 text-[#f2c35d]" aria-hidden="true" />
                    {FEATURED_PLACES.length} điểm bản đồ số
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                    <Route className="h-3.5 w-3.5 text-[#f2c35d]" aria-hidden="true" />
                    {FEATURED_JOURNEYS.length} hành trình gợi ý
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href="/dia-diem-noi-bat"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f2c35d] px-5 py-3.5 text-sm font-extrabold text-[#3b2a0d] shadow-xl shadow-black/20 transition hover:bg-[#ffdc87]"
                  >
                    Khám phá địa điểm
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  {placeCover && (
                    <a
                      href={placeCover.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white"
                    >
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      Ảnh: {placeCover.attribution} · {placeCover.license}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>

          <article className="group relative isolate min-h-[480px] overflow-hidden rounded-[30px] bg-[#163a31] text-white shadow-[0_28px_60px_-34px_rgba(22,58,49,0.74)] md:min-h-[530px]">
            <div
              role="img"
              aria-label={foodCover.alt}
              className="absolute inset-0 -z-30 bg-cover bg-center transition duration-700 group-hover:scale-[1.04]"
              style={{ backgroundImage: `url("${safeBackgroundUrl(foodCover.imageUrl)}")` }}
            />
            <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#09251e] via-[#163a31]/84 to-[#163a31]/18" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_12%,rgba(239,198,116,0.28),transparent_32%)]" />

            <div className="flex min-h-[480px] flex-col justify-between p-7 md:min-h-[530px] md:p-9">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.17em] backdrop-blur">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#efc674]" aria-hidden="true" />
                  Bản đồ vị ngon
                </span>
                <span className="font-heading text-6xl font-bold text-white/25">02</span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efc674]">Ẩm thực địa phương</p>
                <h3 className="mt-4 font-heading text-4xl font-bold uppercase leading-[1.1] tracking-wide md:text-5xl">
                  Ăn gì<br />ở Xuân Hòa?
                </h3>
                <p className="mt-5 text-sm leading-8 text-white/75 md:text-base">
                  Tìm quán ăn, cà phê và món mang đi; xem mô tả ngắn rồi mở vị trí trực tiếp trên Google Maps.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {foodCategories.map(({ key, label, count, icon: Icon }) => (
                    <div key={key} className="rounded-xl border border-white/14 bg-white/9 px-2.5 py-3 text-center backdrop-blur">
                      <Icon className="mx-auto h-4 w-4 text-[#efc674]" aria-hidden="true" />
                      <strong className="mt-1.5 block font-heading text-xl leading-none">{count}</strong>
                      <span className="mt-1 block text-[10px] font-bold text-white/65">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href="/dia-diem-noi-bat/am-thuc"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#efc674] px-5 py-3.5 text-sm font-extrabold text-[#3d2c13] shadow-xl shadow-black/20 transition hover:bg-[#ffdc8b]"
                  >
                    Khám phá ẩm thực
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  <a
                    href={foodCover.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    Ảnh minh họa: {foodCover.credit} · {foodCover.license}
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-[#6d776f]">
          Thông tin địa điểm và ẩm thực được biên tập để hỗ trợ tra cứu; người dùng nên kiểm tra giờ hoạt động và thông tin mới nhất trước khi đến.
        </p>
      </div>
    </section>
  )
}
