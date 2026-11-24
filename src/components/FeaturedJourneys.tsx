'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Baby,
  Building2,
  Clock3,
  Footprints,
  History,
  MapPin,
  Sparkles,
  Waypoints,
} from 'lucide-react'
import {
  FEATURED_PLACES,
  type FeaturedJourney,
  type FeaturedJourneyTheme,
} from '../../data/featured-places'

const TIME_OPTIONS = [
  { value: 60, label: 'Khoảng 1 giờ' },
  { value: 90, label: '90 phút' },
  { value: 120, label: '2 giờ' },
  { value: 180, label: 'Nửa ngày' },
]

const THEME_OPTIONS: Array<{
  value: FeaturedJourneyTheme | 'all'
  label: string
  icon: typeof History
}> = [
  { value: 'all', label: 'Tất cả cảm hứng', icon: Sparkles },
  { value: 'history', label: 'Ký ức lịch sử', icon: History },
  { value: 'architecture', label: 'Kiến trúc & tri thức', icon: Building2 },
  { value: 'faith', label: 'Không gian tĩnh', icon: Waypoints },
  { value: 'family', label: 'Đi cùng gia đình', icon: Baby },
]

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  if (minutes === 60) return '1 giờ'
  if (minutes % 60 === 0) return `${minutes / 60} giờ`
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
}

function getCover(journey: FeaturedJourney) {
  return FEATURED_PLACES.find((place) => place.id === journey.coverPlaceId)?.image
}

export function FeaturedJourneys({ journeys }: { journeys: FeaturedJourney[] }) {
  const [availableTime, setAvailableTime] = useState(180)
  const [theme, setTheme] = useState<FeaturedJourneyTheme | 'all'>('all')

  const recommendations = useMemo(() => {
    const matching = journeys.filter((journey) => {
      const fitsTime = journey.durationMinutes <= availableTime
      const fitsTheme = theme === 'all' || journey.theme === theme
      return fitsTime && fitsTheme
    })

    if (matching.length > 0) return matching

    return [...journeys]
      .filter((journey) => theme === 'all' || journey.theme === theme)
      .sort((a, b) => Math.abs(a.durationMinutes - availableTime) - Math.abs(b.durationMinutes - availableTime))
      .slice(0, 1)
  }, [availableTime, journeys, theme])

  const exactMatch = recommendations.some((journey) => journey.durationMinutes <= availableTime)

  return (
    <section id="hanh-trinh-xuan-hoa" className="relative overflow-hidden bg-[#f4efe5] py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(81,59,31,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(81,59,31,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="container-main relative">
        <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-12">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98522e]">
              <span className="h-px w-8 bg-[#98522e]" />
              Chọn cách bạn muốn đi
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold uppercase leading-[1.08] tracking-wide text-[#17334b] md:text-5xl">
              Hôm nay bạn muốn khám phá Xuân Hòa thế nào?
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#536676] md:text-base">
              Chọn quỹ thời gian và điều khiến bạn tò mò. Chúng tôi sẽ gợi ý một tuyến có nhịp đi, điểm dừng và câu chuyện phù hợp.
            </p>

            <fieldset className="mt-8">
              <legend className="text-sm font-extrabold text-[#17334b]">Bạn có bao lâu?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailableTime(option.value)}
                    aria-pressed={availableTime === option.value}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      availableTime === option.value
                        ? 'border-[#17334b] bg-[#17334b] text-white shadow-lg shadow-[#17334b]/15'
                        : 'border-[#d9cdbb] bg-white/70 text-[#536676] hover:border-[#98522e] hover:text-[#98522e]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-extrabold text-[#17334b]">Bạn muốn cảm nhận điều gì?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const active = theme === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${
                        active
                          ? 'border-[#98522e] bg-[#fff7e9] text-[#8a4223] shadow-sm'
                          : 'border-[#d9cdbb] bg-white/60 text-[#536676] hover:bg-white hover:text-[#17334b]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#98522e]">
                  {exactMatch ? 'Gợi ý dành cho bạn' : 'Gợi ý gần nhất'}
                </p>
                <p className="mt-1 text-sm text-[#657482]">
                  {recommendations.length} hành trình · có thể mở chỉ đường trên Google Maps
                </p>
              </div>
              <a href="#ban-do-xuan-hoa" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#17334b] hover:text-[#98522e]">
                Xem toàn bộ địa điểm
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {recommendations.map((journey, index) => {
                const cover = getCover(journey)
                return (
                  <article
                    key={journey.slug}
                    className={`group relative isolate min-h-[440px] overflow-hidden rounded-[28px] bg-[#17334b] text-white shadow-[0_24px_60px_-30px_rgba(23,51,75,0.62)] ${
                      index === 0 && recommendations.length % 2 === 1 ? 'lg:col-span-2 lg:min-h-[500px]' : ''
                    }`}
                  >
                    {cover && (
                      <div
                        role="img"
                        aria-label={cover.alt}
                        className="absolute inset-0 -z-20 bg-cover bg-center transition duration-700 group-hover:scale-[1.035]"
                        style={{ backgroundImage: `url("${cover.src.replace(/"/g, '\\"')}")` }}
                      />
                    )}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071925] via-[#102b3d]/72 to-[#102b3d]/15" />
                    <div className="flex min-h-[440px] flex-col justify-between p-6 md:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className="rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] backdrop-blur"
                        >
                          {journey.eyebrow}
                        </span>
                        <span className="font-heading text-5xl font-bold text-white/35">0{journeys.indexOf(journey) + 1}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/82">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1.5 backdrop-blur">
                            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatDuration(journey.durationMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1.5 backdrop-blur">
                            <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
                            {journey.distanceKm} km
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1.5 backdrop-blur">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {journey.stops.length} điểm dừng
                          </span>
                        </div>
                        <h3 className="mt-4 max-w-2xl font-heading text-3xl font-bold uppercase leading-tight tracking-wide md:text-4xl">
                          {journey.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base md:leading-7">
                          {journey.tagline}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                          <Link
                            href={`/dia-diem-noi-bat/hanh-trinh/${journey.slug}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#f2c35d] px-4 py-3 text-sm font-extrabold text-[#3b2a0d] shadow-lg transition hover:bg-[#ffdc87]"
                          >
                            Bắt đầu hành trình
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                          </Link>
                          {cover && (
                            <a
                              href={cover.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-white/58 hover:text-white"
                            >
                              Ảnh: {cover.attribution} · {cover.license}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
