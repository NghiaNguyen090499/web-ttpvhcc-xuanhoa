'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  ChevronRight,
  Church,
  Compass,
  ExternalLink,
  Landmark,
  Layers3,
  MapPin,
  Search,
  Trees,
  UtensilsCrossed,
  Vote,
} from 'lucide-react'
import {
  FEATURED_PLACE_CATEGORIES,
  FEATURED_PLACES_MAP_ID,
  type FeaturedPlace,
  type FeaturedPlaceCategory,
  type FeaturedPlaceLayer,
} from '../../data/featured-places'

const CATEGORY_ICONS = {
  heritage: Landmark,
  architecture: Building2,
  culture: Church,
  community: Trees,
  'public-service': MapPin,
  election: Vote,
} satisfies Record<FeaturedPlaceCategory, typeof Landmark>

const categoryOptions = Object.entries(FEATURED_PLACE_CATEGORIES) as [FeaturedPlaceCategory, typeof FEATURED_PLACE_CATEGORIES[FeaturedPlaceCategory]][]

function getMapUrl(place: FeaturedPlace) {
  return `https://www.google.com/maps/d/u/0/embed?mid=${FEATURED_PLACES_MAP_ID}&ll=${place.latitude},${place.longitude}&z=17`
}

function getDirectionsUrl(place: FeaturedPlace) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
}

export function FeaturedPlacesExplorer({ places }: { places: FeaturedPlace[] }) {
  const [activeLayer, setActiveLayer] = useState<FeaturedPlaceLayer | 'all'>('discovery')
  const [activeCategory, setActiveCategory] = useState<FeaturedPlaceCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(places.find((place) => place.isFeatured)?.id ?? places[0]?.id)

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN')

    return places.filter((place) => {
      const matchesLayer = activeLayer === 'all' || place.layer === activeLayer
      const matchesCategory = activeCategory === 'all' || place.category === activeCategory
      const haystack = `${place.name} ${place.address} ${place.summary}`.toLocaleLowerCase('vi-VN')
      return matchesLayer && matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [activeCategory, activeLayer, places, query])

  const visibleCategoryOptions = useMemo(() => {
    return categoryOptions.filter(([key]) => places.some((place) => (
      place.category === key && (activeLayer === 'all' || place.layer === activeLayer)
    )))
  }, [activeLayer, places])

  const layerCounts = useMemo(() => ({
    discovery: places.filter((place) => place.layer === 'discovery').length,
    publicService: places.filter((place) => place.layer === 'public-service').length,
    election: places.filter((place) => place.layer === 'election').length,
  }), [places])

  const selectedPlace = filteredPlaces.find((place) => place.id === selectedId)
    ?? filteredPlaces[0]
    ?? places.find((place) => place.id === selectedId)
    ?? places[0]

  function selectPlace(place: FeaturedPlace) {
    setSelectedId(place.id)
    window.requestAnimationFrame(() => document.getElementById('ban-do-xuan-hoa')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  function selectLayer(layer: FeaturedPlaceLayer | 'all') {
    setActiveLayer(layer)
    setActiveCategory('all')
  }

  return (
    <section className="bg-[#f5f8fb] py-10 md:py-14">
      <div className="container-main">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Bản đồ tương tác</p>
                <h2 className="mt-1 font-heading text-2xl font-bold uppercase tracking-wide text-text-primary md:text-3xl">
                  Chọn một dấu ấn để khám phá
                </h2>
              </div>
              <p className="text-sm text-text-muted">{filteredPlaces.length} / {places.length} địa điểm</p>
            </div>

            <div id="ban-do-xuan-hoa" className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_32px_rgba(15,23,42,0.09)]">
              <div className="relative aspect-[16/11] min-h-[330px] bg-primary-50 sm:aspect-[16/9]">
                {selectedPlace && (
                  <iframe
                    key={selectedPlace.id}
                    title={`Bản đồ vị trí ${selectedPlace.name}`}
                    src={getMapUrl(selectedPlace)}
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071b2e]/90 via-[#071b2e]/48 to-transparent px-5 pb-5 pt-16 text-white">
                  <div className="flex max-w-2xl items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-light">Đang khám phá</p>
                      <h3 className="mt-1 text-lg font-bold leading-tight sm:text-xl">{selectedPlace?.name}</h3>
                      <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-white/78">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {selectedPlace?.address}
                      </p>
                    </div>
                    {selectedPlace && (
                      <a
                        href={getDirectionsUrl(selectedPlace)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary shadow-lg transition hover:bg-primary-50"
                      >
                        Chỉ đường
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className={`border-t border-border bg-white ${selectedPlace?.image ? 'grid sm:grid-cols-[180px_minmax(0,1fr)]' : ''}`}>
                {selectedPlace?.image && <PlaceVisual place={selectedPlace} className="min-h-36 sm:min-h-full" />}
                <div className="px-5 py-4">
                  <p className="text-sm leading-6 text-text-secondary">{selectedPlace?.summary}</p>
                  {selectedPlace?.image && (
                    <a
                      href={selectedPlace.image.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
                    >
                      Ảnh: {selectedPlace.image.attribution} · {selectedPlace.image.license}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-text-primary">
                <Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />
                Lớp nội dung
              </p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => selectLayer('discovery')}
                  aria-pressed={activeLayer === 'discovery'}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${activeLayer === 'discovery' ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface text-text-secondary hover:border-primary/45'}`}
                >
                  <span>Khám phá & di sản</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${activeLayer === 'discovery' ? 'bg-white/18 text-white' : 'bg-primary/10 text-primary'}`}>{layerCounts.discovery}</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectLayer('public-service')}
                  aria-pressed={activeLayer === 'public-service'}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${activeLayer === 'public-service' ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface text-text-secondary hover:border-primary/45'}`}
                >
                  <span>Tiện ích & trụ sở công</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${activeLayer === 'public-service' ? 'bg-white/18 text-white' : 'bg-primary/10 text-primary'}`}>{layerCounts.publicService}</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectLayer('election')}
                  aria-pressed={activeLayer === 'election'}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${activeLayer === 'election' ? 'border-[#7d3f98] bg-[#7d3f98] text-white shadow-sm' : 'border-border bg-surface text-text-secondary hover:border-[#7d3f98]/45'}`}
                >
                  <span>Thông tin bầu cử</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${activeLayer === 'election' ? 'bg-white/18 text-white' : 'bg-[#7d3f98]/10 text-[#7d3f98]'}`}>{layerCounts.election}</span>
                </button>
                <a
                  href="#ban-do-xuan-hoa"
                  className="flex items-center justify-between rounded-xl border border-dashed border-[#a78c67] bg-[#fffaf0] px-3 py-2.5 text-left text-sm font-bold text-[#6f5331] transition hover:border-[#6f5331]"
                >
                  <span>
                    <span className="block">Ranh giới khu phố</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-[#8a765e]">Xem lớp polygon trên bản đồ</span>
                  </span>
                  <span className="rounded-full bg-[#eadfce] px-2 py-0.5 text-xs text-[#6f5331]">24</span>
                </a>
                <a
                  href="/dia-diem-noi-bat/am-thuc"
                  className="flex items-center justify-between rounded-xl border border-dashed border-[#c58c58] bg-[#fff8ee] px-3 py-2.5 text-left text-sm font-bold text-[#8b4d29] transition hover:border-[#8b4d29]"
                >
                  <span className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                    <span>
                      <span className="block">Ẩm thực Xuân Hòa</span>
                      <span className="mt-0.5 block text-[10px] font-medium text-[#9a7559]">Danh sách có ảnh và Google Maps</span>
                    </span>
                  </span>
                  <span className="rounded-full bg-[#f4dfc4] px-2 py-0.5 text-xs text-[#8b4d29]">CMS</span>
                </a>
                <button
                  type="button"
                  onClick={() => selectLayer('all')}
                  aria-pressed={activeLayer === 'all'}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${activeLayer === 'all' ? 'border-[#17334b] bg-[#17334b] text-white shadow-sm' : 'border-border bg-white text-text-muted hover:border-[#17334b]/40 hover:text-[#17334b]'}`}
                >
                  <span>Tất cả địa điểm</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${activeLayer === 'all' ? 'bg-white/18 text-white' : 'bg-surface text-text-muted'}`}>{places.length}</span>
                </button>
              </div>
            </div>

            <div className="my-5 h-px bg-border" />

            <label className="relative block">
              <span className="sr-only">Tìm địa điểm</span>
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên hoặc địa chỉ..."
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-primary-50 text-primary hover:bg-primary-100'}`}
              >
                Tất cả
              </button>
              {visibleCategoryOptions.map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeCategory === key ? category.color : 'bg-surface text-text-secondary hover:bg-primary-50 hover:text-primary'}`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="mt-4 max-h-[470px] space-y-2 overflow-y-auto pr-1">
              {filteredPlaces.map((place) => {
                const Icon = CATEGORY_ICONS[place.category]
                const category = FEATURED_PLACE_CATEGORIES[place.category]
                const isSelected = place.id === selectedPlace?.id

                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className={`group flex w-full gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-primary bg-primary-50 shadow-sm' : 'border-border bg-white hover:border-primary/45 hover:bg-surface'}`}
                  >
                    {place.image ? (
                      <PlaceVisual place={place} className="h-12 w-12 shrink-0 rounded-lg" />
                    ) : (
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${category.color}`}>
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-text-muted">{category.label}</span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-text-primary group-hover:text-primary">{place.name}</span>
                      <span className="mt-1 block truncate text-xs text-text-muted">{place.address}</span>
                    </span>
                    <ChevronRight className={`mt-2 h-4 w-4 shrink-0 transition ${isSelected ? 'text-primary' : 'text-text-muted group-hover:translate-x-0.5 group-hover:text-primary'}`} aria-hidden="true" />
                  </button>
                )
              })}
              {filteredPlaces.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
                  <Compass className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-text-primary">Chưa tìm thấy địa điểm</p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">Thử tên công trình, tuyến đường hoặc chọn lại nhóm địa điểm.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function PlaceVisual({ place, className }: { place: FeaturedPlace; className: string }) {
  if (!place.image) return null

  return (
    <div
      role="img"
      aria-label={place.image.alt}
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${place.image.src.replace(/"/g, '\\"')}")` }}
    />
  )
}
