'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bike,
  CakeSlice,
  Clock3,
  Coffee,
  Leaf,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import type { FoodPlace, FoodPlaceCategory } from '@/types/food-place'

type CategoryOption = {
  value: FoodPlaceCategory | 'all'
  label: string
  shortLabel: string
  icon: typeof UtensilsCrossed
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'Tất cả địa điểm', shortLabel: 'Tất cả', icon: Store },
  { value: 'restaurant', label: 'Quán ăn & nhà hàng', shortLabel: 'Quán ăn', icon: UtensilsCrossed },
  { value: 'cafe', label: 'Cà phê & trà', shortLabel: 'Cà phê', icon: Coffee },
  { value: 'bakery', label: 'Tiệm bánh & món ngọt', shortLabel: 'Tiệm bánh', icon: CakeSlice },
  { value: 'vegetarian', label: 'Ẩm thực chay', shortLabel: 'Ăn chay', icon: Leaf },
  { value: 'takeaway', label: 'Món nhanh & mang đi', shortLabel: 'Mang đi', icon: Bike },
  { value: 'other', label: 'Ẩm thực khác', shortLabel: 'Khác', icon: Store },
]

export function FoodPlacesExplorer({ places, updatedLabel }: { places: FoodPlace[]; updatedLabel?: string }) {
  const [category, setCategory] = useState<FoodPlaceCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const categoryCounts = useMemo(() => places.reduce<Partial<Record<FoodPlaceCategory, number>>>((counts, place) => {
    counts[place.category] = (counts[place.category] ?? 0) + 1
    return counts
  }, {}), [places])

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN')
    return places.filter((place) => {
      const matchesCategory = category === 'all' || place.category === category
      const matchesFeatured = !featuredOnly || place.isFeatured
      const haystack = `${place.name} ${place.address} ${place.summary}`.toLocaleLowerCase('vi-VN')
      return matchesCategory && matchesFeatured && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [category, featuredOnly, places, query])

  return (
    <section className="bg-[#f7f3eb] py-10 md:py-14">
      <div className="container-main">
        <div className="rounded-[28px] border border-[#e5d8c4] bg-white p-4 shadow-[0_24px_70px_rgba(91,65,35,0.10)] sm:p-6 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-2xl bg-[#173d35] p-5 text-white lg:sticky lg:top-24 lg:self-start">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f0c875]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Chọn khẩu vị
              </p>
              <label className="relative mt-4 block">
                <span className="sr-only">Tìm quán ăn</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên quán, địa chỉ..." className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#f0c875] focus:ring-2 focus:ring-[#f0c875]/20" />
              </label>

              <div className="mt-4 space-y-2">
                {CATEGORY_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const count = option.value === 'all' ? places.length : (categoryCounts[option.value] ?? 0)
                  if (option.value !== 'all' && count === 0) return null
                  return (
                    <button key={option.value} type="button" onClick={() => setCategory(option.value)} aria-pressed={category === option.value} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${category === option.value ? 'bg-[#f0c875] text-[#342612]' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{option.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${category === option.value ? 'bg-black/10' : 'bg-white/10'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>

              <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 border-t border-white/15 pt-5 text-sm font-bold">
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-[#f0c875]" aria-hidden="true" />Chỉ xem nổi bật</span>
                <input type="checkbox" checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} className="h-4 w-4 accent-[#f0c875]" />
              </label>

              <div className="mt-5 rounded-xl border border-white/12 bg-white/8 p-3 text-[11px] leading-5 text-white/65">
                <p className="font-bold text-white">Danh sách được biên tập</p>
                <p className="mt-1">Thông tin và hình ảnh do cán bộ phụ trách nội dung kiểm tra, cập nhật trong CMS.</p>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-col gap-3 border-b border-[#eee5d8] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a15c2f]">Hương vị quanh phường</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-[#24342f] md:text-3xl">Hôm nay ăn gì?</h2>
                </div>
                <div className="text-sm text-[#6d746f]"><span className="font-bold text-[#24342f]">{filteredPlaces.length}</span> địa điểm phù hợp{updatedLabel && <span className="mt-0.5 block text-xs">Cập nhật {updatedLabel}</span>}</div>
              </div>

              <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {CATEGORY_OPTIONS.map((option) => {
                  const count = option.value === 'all' ? places.length : (categoryCounts[option.value] ?? 0)
                  if (option.value !== 'all' && count === 0) return null
                  return <button key={option.value} type="button" onClick={() => setCategory(option.value)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === option.value ? 'bg-[#173d35] text-white' : 'bg-[#f5efe5] text-[#6b5139]'}`}>{option.shortLabel} · {count}</button>
                })}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredPlaces.map((place) => <FoodPlaceCard key={place.id} place={place} />)}
              </div>

              {filteredPlaces.length === 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-[#d8c8b1] bg-[#fffaf2] px-5 py-16 text-center">
                  <UtensilsCrossed className="mx-auto h-9 w-9 text-[#a15c2f]" aria-hidden="true" />
                  <p className="mt-3 font-bold text-[#24342f]">Chưa tìm thấy địa điểm phù hợp</p>
                  <p className="mt-1 text-sm text-[#6d746f]">Hãy thử bỏ bộ lọc nổi bật hoặc chọn nhóm ẩm thực khác.</p>
                </div>
              )}

              {places.some((place) => place.sourceName?.includes('OpenStreetMap')) && (
                <p className="mt-7 text-xs leading-5 text-[#69716c]">Một phần dữ liệu vị trí ban đầu có nguồn từ <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="font-bold text-[#3b574e] underline">© OpenStreetMap contributors</a>, được cung cấp theo giấy phép ODbL. Nội dung mô tả và trạng thái hiển thị do phường biên tập.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FoodPlaceCard({ place }: { place: FoodPlace }) {
  const category = CATEGORY_OPTIONS.find((option) => option.value === place.category)
  const CategoryIcon = category?.icon ?? Store
  const phoneHref = place.phone?.replace(/[^0-9+]/g, '')

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-[#e8dfd2] bg-white transition hover:-translate-y-1 hover:border-[#c69a61] hover:shadow-[0_18px_36px_rgba(90,62,30,0.13)]">
      <div
        className={`relative aspect-[4/3] overflow-hidden ${place.imageUrl ? 'bg-cover bg-center' : 'bg-[radial-gradient(circle_at_75%_20%,rgba(240,200,117,0.30),transparent_32%),linear-gradient(135deg,#173d35,#24594d)]'}`}
        style={place.imageUrl ? { backgroundImage: `url("${place.imageUrl.replace(/"/g, '\\"')}")` } : undefined}
        role="img"
        aria-label={place.imageUrl ? (place.imageAlt ?? `Ảnh ${place.name}`) : `Ảnh thực tế của ${place.name} đang được cập nhật`}
      >
        {!place.imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner">
              <CategoryIcon className="h-8 w-8 text-[#f0c875]" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-extrabold">Đang cập nhật ảnh thực tế</p>
            <p className="mt-1 text-xs leading-5 text-white/65">Ảnh sẽ hiển thị sau khi được xác thực đúng địa điểm.</p>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/55 to-transparent p-3 pb-10">
          <span className="rounded-full bg-[#f0c875] px-2.5 py-1 text-xs font-extrabold text-[#342612]">{place.isFeatured ? 'Địa điểm nổi bật' : category?.shortLabel}</span>
          {place.rating !== undefined && <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#755000]"><Star className="h-3.5 w-3.5 fill-[#e7a719] text-[#e7a719]" />{place.rating.toFixed(1)}</span>}
        </div>
        {place.imageUrl && place.imageCredit && (
          place.imageSourceUrl
            ? <a href={place.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 text-[10px] text-white/80 hover:text-white">Ảnh: {place.imageCredit}</a>
            : <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 text-[10px] text-white/80">Ảnh: {place.imageCredit}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#a15c2f]"><CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />{category?.label ?? 'Ẩm thực'}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-snug text-[#24342f] group-hover:text-[#8b4d29]">{place.name}</h3>
        {place.rating !== undefined && (
          <p className="mt-1 text-xs text-[#7a7f7c]">Điểm Google tham khảo: <span className="font-bold text-[#755000]">{place.rating.toFixed(1)}★</span>{place.userRatingCount !== undefined && ` · ${place.userRatingCount.toLocaleString('vi-VN')} lượt`}{place.reviewedAt && ` · kiểm tra ${place.reviewedAt.split('-').reverse().join('/')}`}</p>
        )}
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#606965]">{place.summary}</p>
        <p className="mt-3 flex items-start gap-1.5 text-sm leading-6 text-[#606965]"><MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-[#a15c2f]" aria-hidden="true" /><span className="line-clamp-2">{place.address}</span></p>
        <div className="mt-2 space-y-1 text-xs text-[#68716d]">
          {place.openingHours && <p className="flex items-start gap-1.5"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{place.openingHours}</p>}
          {place.priceLabel && <p>Mức giá tham khảo: {place.priceLabel}</p>}
          {place.phone && <a href={`tel:${phoneHref}`} className="flex items-center gap-1.5 font-semibold text-[#3b574e] hover:underline"><Phone className="h-3.5 w-3.5" />{place.phone}</a>}
        </div>

        <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#173d35] px-3 py-2.5 pt-3 text-xs font-bold text-white transition hover:bg-[#0e2f28]">
          Mở trên Google Maps <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        {place.sourceName && place.sourceUrl && <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-center text-[10px] text-[#8a908c] hover:underline">Dữ liệu vị trí ban đầu: {place.sourceName}</a>}
      </div>
    </article>
  )
}
