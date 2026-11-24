import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, Camera, Clock3, MapPinned, ShieldCheck, UtensilsCrossed } from 'lucide-react'
import { FoodPlacesExplorer } from '@/components/FoodPlacesExplorer'
import { getFoodPlacesContent } from '@/lib/food-places'
import { FOOD_CATEGORY_VISUALS } from '@/lib/food-category-visuals'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ăn gì ở Xuân Hòa?',
  description: 'Khám phá danh sách quán ăn, cà phê và địa điểm ẩm thực do phường Xuân Hòa biên tập, kèm hình ảnh và liên kết Google Maps.',
}

const criteria = [
  { icon: BadgeCheck, value: 'Được biên tập', label: 'Cán bộ phụ trách kiểm tra' },
  { icon: Camera, value: 'Ảnh trực quan', label: 'Ảnh có nguồn hoặc được cung cấp' },
  { icon: MapPinned, value: 'Google Maps', label: 'Mở vị trí và chỉ đường nhanh' },
  { icon: Clock3, value: 'Luôn cập nhật', label: 'Chỉnh sửa trực tiếp trong CMS' },
]

export default async function XuanHoaFoodPage() {
  const content = await getFoodPlacesContent()
  const places = content.items
    .filter((item) => item.isActive)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))
  const updatedLabel = content.updatedAt.split('-').reverse().join('/')

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#102f29] px-4 py-14 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_22%,rgba(238,183,88,0.30),transparent_22%),radial-gradient(circle_at_12%_82%,rgba(104,168,135,0.22),transparent_28%)]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full border border-[#efc674]/20" />
        <div className="pointer-events-none absolute right-[12%] top-[18%] hidden h-44 w-44 rotate-12 rounded-[40%] border border-white/10 lg:block" />

        <div className="container-main">
          <Link href="/dia-diem-noi-bat" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Trở lại Khám phá Xuân Hòa
          </Link>

          <div className="mt-9 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#efc674]/35 bg-[#efc674]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#efc674]">
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                Bản đồ vị ngon địa phương
              </p>
              <h1 className="mt-5 max-w-4xl font-heading text-5xl font-bold uppercase leading-[0.96] tracking-wide md:text-7xl">
                Ăn gì<br /><span className="text-[#efc674]">ở Xuân Hòa?</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
                Từ ly cà phê đầu ngày đến bữa tối ấm cúng — khám phá những địa chỉ được cộng đồng yêu thích, nằm ngay trong ranh giới phường.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/8 backdrop-blur">
              <div role="img" aria-label={FOOD_CATEGORY_VISUALS.restaurant.alt} className="relative aspect-[16/8] bg-cover bg-center" style={{ backgroundImage: `url("${FOOD_CATEGORY_VISUALS.restaurant.imageUrl.replace(/"/g, '\\"')}")` }}>
                <a href={FOOD_CATEGORY_VISUALS.restaurant.sourceUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-2 pt-8 text-[10px] text-white/80 hover:text-white">Ảnh minh họa: {FOOD_CATEGORY_VISUALS.restaurant.credit} · {FOOD_CATEGORY_VISUALS.restaurant.license}</a>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#efc674]">Cách chúng tôi chọn</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Mỗi địa điểm được biên tập thủ công, có hình ảnh, mô tả ngắn và liên kết Google Maps để người dân kiểm tra trước khi ghé thăm.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {criteria.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.value} className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/7 px-4 py-3 backdrop-blur">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#efc674] text-[#3d2c13]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{item.value}</span>
                    <span className="block text-[11px] text-white/60">{item.label}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {places.length > 0 ? (
        <FoodPlacesExplorer places={places} updatedLabel={updatedLabel} />
      ) : (
        <EmptyState />
      )}

      <section className="bg-white py-10 md:py-14">
        <div className="container-main grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-2xl border border-[#dbe8e3] bg-[#f3f9f6] p-6 md:p-8">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#226252]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Minh bạch dữ liệu
            </p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">Một gợi ý tốt cần đúng chỗ và đúng lúc</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Danh sách được quản lý trực tiếp bởi cán bộ phụ trách nội dung. Nếu có hiển thị điểm Google, đó là số liệu tham khảo tại ngày kiểm tra; giờ mở cửa và mức giá có thể thay đổi, vui lòng xác nhận lại với địa điểm trước khi di chuyển.
            </p>
          </div>
          <Link href="/lien-he" className="group flex items-center justify-between gap-4 rounded-2xl bg-[#a15c2f] p-6 text-white transition hover:bg-[#844722]">
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#ffe0b6]">Bạn biết một quán hay?</span>
              <span className="mt-2 block text-lg font-bold">Gợi ý cho phường Xuân Hòa</span>
              <span className="mt-1 block text-sm text-white/75">Gửi tên và địa chỉ để đội ngũ kiểm tra.</span>
            </span>
            <UtensilsCrossed className="h-6 w-6 shrink-0 transition group-hover:rotate-6" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

function EmptyState() {
  return (
    <section className="bg-[#f7f3eb] py-12 md:py-16">
      <div className="container-main">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-[#e2d4bf] bg-white px-6 py-12 text-center shadow-[0_20px_60px_rgba(87,60,30,0.09)] md:px-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef6f2] text-[#226252]">
            <UtensilsCrossed className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold text-[#24342f]">Danh sách ẩm thực đang được biên tập</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#69716c]">
            Các địa điểm đầu tiên sẽ sớm được cập nhật kèm ảnh, thông tin ngắn và liên kết Google Maps. Bạn có thể gửi gợi ý để đội ngũ nội dung kiểm tra và bổ sung.
          </p>
          <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-2">
            {(['restaurant', 'cafe', 'bakery'] as const).map((category) => {
              const visual = FOOD_CATEGORY_VISUALS[category]
              return <a key={category} href={visual.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Xem nguồn ${visual.alt}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-cover bg-center" style={{ backgroundImage: `url("${visual.imageUrl.replace(/"/g, '\\"')}")` }}><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6 text-[9px] text-white/80">Ảnh minh họa · {visual.license}</span></a>
            })}
          </div>
          <Link href="/lien-he" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173d35] px-4 py-3 text-sm font-bold text-white hover:bg-[#0e2f28]">Gửi gợi ý địa điểm <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
        </div>
      </div>
    </section>
  )
}
