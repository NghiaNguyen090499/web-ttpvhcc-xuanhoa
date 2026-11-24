import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Binoculars,
  Clock3,
  ExternalLink,
  Footprints,
  Info,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  SunMedium,
} from 'lucide-react'
import {
  FEATURED_JOURNEYS,
  getFeaturedJourney,
  getFeaturedPlace,
  type FeaturedPlace,
} from '../../../../../../data/featured-places'

export function generateStaticParams() {
  return FEATURED_JOURNEYS.map((journey) => ({ slug: journey.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const journey = getFeaturedJourney(slug)
  if (!journey) return { title: 'Không tìm thấy hành trình' }

  return {
    title: `${journey.title} | Khám phá Xuân Hòa`,
    description: journey.tagline,
  }
}

function formatDuration(minutes: number) {
  if (minutes === 60) return '1 giờ'
  if (minutes % 60 === 0) return `${minutes / 60} giờ`
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
}

function getDirectionsUrl(places: FeaturedPlace[]) {
  if (places.length === 0) return '#'

  const location = (place: FeaturedPlace) => `${place.latitude},${place.longitude}`
  const origin = location(places[0])
  const destination = location(places[places.length - 1])
  const waypoints = places.slice(1, -1).map(location).join('|')

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'walking',
  })
  if (waypoints) params.set('waypoints', waypoints)

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function getPlaceDirectionsUrl(place: FeaturedPlace) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`
}

export default async function JourneyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const journey = getFeaturedJourney(slug)
  if (!journey) notFound()

  const stops = journey.stops
    .map((stop) => ({ ...stop, place: getFeaturedPlace(stop.placeId) }))
    .filter((stop): stop is typeof stop & { place: FeaturedPlace } => Boolean(stop.place))
  const places = stops.map((stop) => stop.place)
  const cover = getFeaturedPlace(journey.coverPlaceId)?.image
  const completeRouteUrl = getDirectionsUrl(places)

  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#102f46] px-4 py-12 text-white md:py-20"
        style={cover ? {
          backgroundImage: `linear-gradient(90deg, rgba(6, 26, 39, 0.97) 0%, rgba(10, 38, 55, 0.86) 48%, rgba(10, 38, 55, 0.32) 100%), url("${cover.src.replace(/"/g, '\\"')}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_22%,rgba(242,195,93,0.22),transparent_24%)]" />
        <div className="container-main">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-white/65" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <Link href="/dia-diem-noi-bat" className="hover:text-white">Khám phá Xuân Hòa</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/90">{journey.title}</span>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#f2c35d]">{journey.eyebrow}</p>
            <h1 className="mt-4 font-heading text-4xl font-bold uppercase leading-[1.06] tracking-wide md:text-6xl">
              {journey.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 md:text-lg">{journey.tagline}</p>
            <a
              href={completeRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#f2c35d] px-4 py-3 text-sm font-extrabold text-[#3b2a0d] shadow-xl transition hover:bg-[#ffdc87]"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Mở toàn tuyến trên Google Maps
            </a>
          </div>

          {cover && (
            <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-9 block w-fit text-[11px] text-white/55 hover:text-white">
              Ảnh: {cover.attribution} · {cover.license}
            </a>
          )}
        </div>
      </section>

      <section className="border-b border-[#d9cdbb] bg-[#fffaf0]">
        <div className="container-main grid grid-cols-2 divide-x divide-y divide-[#e3d8c7] sm:grid-cols-4 sm:divide-y-0">
          <JourneyStat icon={Clock3} label="Thời lượng" value={formatDuration(journey.durationMinutes)} />
          <JourneyStat icon={Footprints} label="Khoảng cách" value={`${journey.distanceKm} km`} />
          <JourneyStat icon={MapPin} label="Điểm dừng" value={`${stops.length} địa điểm`} />
          <JourneyStat icon={SunMedium} label="Thời điểm đẹp" value={journey.bestTime} />
        </div>
      </section>

      <section className="bg-[#f7f3eb] py-12 md:py-16">
        <div className="container-main grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <section className="rounded-[28px] border border-[#ddd1bf] bg-white p-6 shadow-[0_20px_50px_-34px_rgba(30,48,63,0.38)] md:p-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#98522e]">Lời dẫn hành trình</p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-[#17334b]">Một tuyến đi, nhiều lớp chuyện</h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#536676]">{journey.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {journey.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full border border-[#ead9bf] bg-[#fff7e9] px-3 py-1.5 text-xs font-bold text-[#7b4b2a]">
                    {highlight}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-8" aria-labelledby="route-heading">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#98522e]">Lộ trình từng điểm</p>
                  <h2 id="route-heading" className="mt-2 font-heading text-3xl font-bold uppercase tracking-wide text-[#17334b] md:text-4xl">
                    Bắt đầu hành trình của bạn
                  </h2>
                </div>
                <Route className="hidden h-10 w-10 text-[#98522e] sm:block" aria-hidden="true" />
              </div>

              <ol className="mt-7 space-y-0">
                {stops.map((stop, index) => (
                  <li key={stop.placeId} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-4 md:grid-cols-[64px_minmax(0,1fr)] md:gap-6">
                    <div className="flex flex-col items-center">
                      <span
                        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#f7f3eb] font-heading text-xl font-bold text-white shadow-md md:h-14 md:w-14"
                        style={{ backgroundColor: journey.color }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {index < stops.length - 1 && <span className="min-h-16 w-px flex-1 bg-[#cbbba6]" aria-hidden="true" />}
                    </div>

                    <article className="mb-6 overflow-hidden rounded-[24px] border border-[#ddd1bf] bg-white shadow-[0_16px_42px_-32px_rgba(30,48,63,0.42)]">
                      {stop.place.image && (
                        <div
                          role="img"
                          aria-label={stop.place.image.alt}
                          className="aspect-[16/7] bg-cover bg-center"
                          style={{ backgroundImage: `linear-gradient(0deg,rgba(8,26,38,0.32),transparent),url("${stop.place.image.src.replace(/"/g, '\\"')}")` }}
                        />
                      )}
                      <div className="p-5 md:p-7">
                        {stop.minutesFromPrevious && (
                          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#eef5f7] px-2.5 py-1 text-xs font-bold text-[#496372]">
                            <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
                            Khoảng {stop.minutesFromPrevious} phút từ điểm trước
                          </p>
                        )}
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#98522e]">{stop.label}</p>
                        <h3 className="mt-2 text-xl font-extrabold leading-snug text-[#17334b] md:text-2xl">{stop.place.name}</h3>
                        <p className="mt-2 flex items-start gap-1.5 text-sm leading-6 text-[#71808b]">
                          <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#98522e]" aria-hidden="true" />
                          {stop.place.address}
                        </p>
                        <p className="mt-4 text-sm leading-7 text-[#536676] md:text-base">{stop.narrative}</p>

                        {stop.lookCloser && (
                          <div className="mt-5 rounded-2xl border border-[#ead9bf] bg-[#fff8eb] p-4">
                            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#7f482b]">
                              <Binoculars className="h-4 w-4" aria-hidden="true" />
                              Nhìn kỹ một chút
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#66594d]">{stop.lookCloser}</p>
                          </div>
                        )}

                        <a
                          href={getPlaceDirectionsUrl(stop.place)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0b638f] hover:text-[#98522e]"
                        >
                          Chỉ đường đến điểm này
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-[24px] bg-[#17334b] p-6 text-white shadow-[0_24px_48px_-32px_rgba(23,51,75,0.72)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f2c35d]">Trước khi khởi hành</p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-white/78">
                <p className="flex gap-3">
                  <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-[#f2c35d]" aria-hidden="true" />
                  {journey.difficulty}
                </p>
                <p className="flex gap-3">
                  <SunMedium className="mt-0.5 h-4 w-4 shrink-0 text-[#f2c35d]" aria-hidden="true" />
                  Nên đi: {journey.bestTime}
                </p>
                <p className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#f2c35d]" aria-hidden="true" />
                  Mang nước, giữ an toàn khi qua đường và tuân thủ quy định của từng địa điểm.
                </p>
              </div>
              <a
                href={completeRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-[#f2c35d] px-4 py-3 text-sm font-extrabold text-[#3b2a0d] transition hover:bg-[#ffdc87]"
              >
                Mở chỉ đường toàn tuyến
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            {journey.notice && (
              <div className="rounded-[24px] border border-[#d8c7ab] bg-[#fffaf0] p-5">
                <p className="flex items-center gap-2 text-sm font-extrabold text-[#17334b]">
                  <Info className="h-4 w-4 text-[#98522e]" aria-hidden="true" />
                  Lưu ý nội dung
                </p>
                <p className="mt-2 text-sm leading-6 text-[#66594d]">{journey.notice}</p>
              </div>
            )}

            <div className="rounded-[24px] border border-dashed border-[#b8a78e] bg-white/65 p-5">
              <p className="text-sm font-extrabold text-[#17334b]">Dữ liệu đang được hoàn thiện</p>
              <p className="mt-2 text-xs leading-6 text-[#657482]">
                Tuyến đi, giờ mở cửa và khả năng tiếp cận cần được xác thực thực địa trước khi sử dụng như hướng dẫn chính thức.
              </p>
            </div>

            <Link href="/dia-diem-noi-bat#hanh-trinh-xuan-hoa" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#17334b] hover:text-[#98522e]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Chọn hành trình khác
            </Link>
          </aside>
        </div>
      </section>
    </>
  )
}

function JourneyStat({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="flex min-h-28 items-start gap-3 px-4 py-5 sm:min-h-32 sm:px-5 sm:py-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1e5d3] text-[#98522e]">
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7a827f]">{label}</span>
        <strong className="mt-1 block text-sm leading-6 text-[#17334b]">{value}</strong>
      </span>
    </div>
  )
}
