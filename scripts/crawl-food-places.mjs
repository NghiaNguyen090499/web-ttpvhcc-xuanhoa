import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()
const boundary = JSON.parse(readFileSync(join(projectRoot, 'data', 'xuan-hoa-boundary.json'), 'utf-8'))
const outputFile = join(projectRoot, 'data', 'food-places.json')
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function query() {
  const polygon = boundary.coordinates.map(([latitude, longitude]) => `${latitude} ${longitude}`).join(' ')
  return `[out:json][timeout:45];(
    nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"]["name"](poly:"${polygon}");
    nwr["shop"="bakery"]["name"](poly:"${polygon}");
  );out center tags;`
}

function categoryFromTags(tags) {
  const cuisine = tags.cuisine?.toLowerCase() ?? ''
  if (cuisine.includes('vegetarian') || cuisine.includes('vegan')) return 'vegetarian'
  if (tags.shop === 'bakery') return 'bakery'
  if (tags.amenity === 'cafe' || tags.amenity === 'ice_cream') return 'cafe'
  if (tags.amenity === 'fast_food') return 'takeaway'
  if (tags.amenity === 'restaurant' || tags.amenity === 'food_court') return 'restaurant'
  return 'other'
}

function normalize(element, sortOrder) {
  const tags = element.tags ?? {}
  const name = tags['name:vi'] ?? tags.name
  const latitude = element.lat ?? element.center?.lat
  const longitude = element.lon ?? element.center?.lon
  if (!name || typeof latitude !== 'number' || typeof longitude !== 'number') return null

  const category = categoryFromTags(tags)
  const street = tags['addr:street'] ?? tags['addr:place']
  const streetAddress = tags['addr:full'] ?? [tags['addr:housenumber'], street].filter(Boolean).join(' ')
  const labels = {
    restaurant: 'Quán ăn hoặc nhà hàng', cafe: 'Quán cà phê, trà hoặc món ngọt',
    bakery: 'Tiệm bánh', vegetarian: 'Địa điểm ẩm thực chay',
    takeaway: 'Địa điểm món nhanh hoặc mang đi', other: 'Địa điểm ẩm thực',
  }
  const cuisine = tags.cuisine?.split(';').join(', ')

  return {
    id: `osm-${element.type}-${element.id}`,
    name: name.trim(),
    address: streetAddress ? `${streetAddress}, Phường Xuân Hòa, TP.HCM` : 'Phường Xuân Hòa, TP.HCM — cần xác minh địa chỉ',
    summary: `${labels[category]} được phát hiện từ dữ liệu mở OpenStreetMap${cuisine ? `; loại món được ghi nhận: ${cuisine}` : ''}. Cần kiểm tra và bổ sung mô tả trước khi công khai.`,
    category,
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    ...(tags.opening_hours ? { openingHours: tags.opening_hours } : {}),
    ...((tags.phone ?? tags['contact:phone']) ? { phone: tags.phone ?? tags['contact:phone'] } : {}),
    latitude,
    longitude,
    sourceName: 'OpenStreetMap contributors',
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    isFeatured: false,
    isActive: false,
    sortOrder,
  }
}

async function crawl() {
  let lastError
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'XuanHoaPortal/1.0 (TTPVHCC Phuong Xuan Hoa)',
        },
        body: new URLSearchParams({ data: query() }),
      })
      if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`)
      const data = await response.json()
      return (data.elements ?? [])
        .map((element, index) => normalize(element, index + 1))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('Không thể tải dữ liệu OpenStreetMap')
}

const current = JSON.parse(readFileSync(outputFile, 'utf-8'))
const crawled = await crawl()
const existingIds = new Set((current.items ?? []).map((item) => item.id))
const imported = crawled.filter((item) => !existingIds.has(item.id))
const output = {
  updatedAt: new Date().toISOString().slice(0, 10),
  items: [...(current.items ?? []), ...imported],
}

writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8')
console.log(JSON.stringify({ found: crawled.length, imported: imported.length, skipped: crawled.length - imported.length }, null, 2))
