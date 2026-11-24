import boundary from '../../data/xuan-hoa-boundary.json'
import type { FoodPlace, FoodPlaceCategory } from '@/types/food-place'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

type OsmElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

type OverpassResponse = { elements?: OsmElement[] }

function buildQuery() {
  const polygon = boundary.coordinates.map(([latitude, longitude]) => `${latitude} ${longitude}`).join(' ')
  return `[out:json][timeout:45];(
    nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"]["name"](poly:"${polygon}");
    nwr["shop"="bakery"]["name"](poly:"${polygon}");
  );out center tags;`
}

function categoryFromTags(tags: Record<string, string>): FoodPlaceCategory {
  const cuisine = tags.cuisine?.toLowerCase() ?? ''
  if (cuisine.includes('vegetarian') || cuisine.includes('vegan')) return 'vegetarian'
  if (tags.shop === 'bakery') return 'bakery'
  if (tags.amenity === 'cafe' || tags.amenity === 'ice_cream') return 'cafe'
  if (tags.amenity === 'fast_food') return 'takeaway'
  if (tags.amenity === 'restaurant' || tags.amenity === 'food_court') return 'restaurant'
  return 'other'
}

function addressFromTags(tags: Record<string, string>) {
  const street = tags['addr:street'] ?? tags['addr:place']
  const address = [tags['addr:housenumber'], street].filter(Boolean).join(' ')
  return address ? `${address}, Phường Xuân Hòa, TP.HCM` : 'Phường Xuân Hòa, TP.HCM — cần xác minh địa chỉ'
}

function summaryFor(category: FoodPlaceCategory, tags: Record<string, string>) {
  const cuisine = tags.cuisine?.split(';').join(', ')
  const labels: Record<FoodPlaceCategory, string> = {
    restaurant: 'Quán ăn hoặc nhà hàng',
    cafe: 'Quán cà phê, trà hoặc món ngọt',
    bakery: 'Tiệm bánh',
    vegetarian: 'Địa điểm ẩm thực chay',
    takeaway: 'Địa điểm món nhanh hoặc mang đi',
    other: 'Địa điểm ẩm thực',
  }
  return `${labels[category]} được phát hiện từ dữ liệu mở OpenStreetMap${cuisine ? `; loại món được ghi nhận: ${cuisine}` : ''}. Cần kiểm tra và bổ sung mô tả trước khi công khai.`
}

function normalizeElement(element: OsmElement, sortOrder: number): FoodPlace | null {
  const tags = element.tags ?? {}
  const name = tags['name:vi'] ?? tags.name
  const latitude = element.lat ?? element.center?.lat
  const longitude = element.lon ?? element.center?.lon
  if (!name || typeof latitude !== 'number' || typeof longitude !== 'number') return null

  const category = categoryFromTags(tags)
  return {
    id: `osm-${element.type}-${element.id}`,
    name: name.trim(),
    address: addressFromTags(tags),
    summary: summaryFor(category, tags),
    category,
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    openingHours: tags.opening_hours,
    phone: tags.phone ?? tags['contact:phone'],
    latitude,
    longitude,
    sourceName: 'OpenStreetMap contributors',
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    isFeatured: false,
    isActive: false,
    sortOrder,
  }
}

async function fetchEndpoint(endpoint: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 55_000)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'XuanHoaPortal/1.0 (TTPVHCC Phuong Xuan Hoa)',
      },
      body: new URLSearchParams({ data: buildQuery() }),
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`)
    return await response.json() as OverpassResponse
  } finally {
    clearTimeout(timeout)
  }
}

export async function crawlXuanHoaFoodPlaces(): Promise<FoodPlace[]> {
  let lastError: unknown
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchEndpoint(endpoint)
      return (data.elements ?? [])
        .map((element, index) => normalizeElement(element, index + 1))
        .filter((item): item is FoodPlace => Boolean(item))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Không thể kết nối dịch vụ dữ liệu mở')
}
