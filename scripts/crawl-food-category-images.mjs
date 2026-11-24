import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const selectedFiles = {
  restaurant: 'File:Nem nướng by Baoothersks.jpg',
  cafe: 'File:Ca Phe Sua Da.jpg',
  bakery: 'File:Banh mi - flickr5607479129.jpg',
  vegetarian: 'File:Gỏi Cuốn Chay Vietnamese Fresh Vegetarian Spring Roll 2019-1599.jpg',
  takeaway: 'File:Special Baguette (Bánh mì) - Banh Mi Ancient Saigon 2024-12-20.jpg',
  other: 'File:Chè Bắp.jpg',
}

const altText = {
  restaurant: 'Ảnh minh họa món ăn Việt Nam',
  cafe: 'Ảnh minh họa cà phê sữa đá Việt Nam',
  bakery: 'Ảnh minh họa bánh mì Việt Nam',
  vegetarian: 'Ảnh minh họa gỏi cuốn chay Việt Nam',
  takeaway: 'Ảnh minh họa bánh mì mang đi',
  other: 'Ảnh minh họa món chè Việt Nam',
}

function cleanText(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const endpoint = new URL('https://commons.wikimedia.org/w/api.php')
const parameters = {
  action: 'query',
  titles: Object.values(selectedFiles).join('|'),
  prop: 'imageinfo',
  iiprop: 'url|mime|extmetadata',
  iiurlwidth: '1200',
  format: 'json',
  formatversion: '2',
  origin: '*',
}
Object.entries(parameters).forEach(([key, value]) => endpoint.searchParams.set(key, value))

const response = await fetch(endpoint, {
  headers: {
    Accept: 'application/json',
    'User-Agent': 'XuanHoaPortal/1.0 xuanhoa@tphcm.gov.vn',
  },
})
if (!response.ok) throw new Error(`Wikimedia Commons HTTP ${response.status}`)

const data = await response.json()
const pages = new Map((data.query?.pages ?? []).map((page) => [page.title, page]))
const visuals = {}

for (const [category, title] of Object.entries(selectedFiles)) {
  const info = pages.get(title)?.imageinfo?.[0]
  if (!info?.thumburl || info.mime !== 'image/jpeg') throw new Error(`Không tải được ảnh ${title}`)
  visuals[category] = {
    imageUrl: info.thumburl,
    alt: altText[category],
    credit: cleanText(info.extmetadata?.Artist?.value) || 'Wikimedia Commons contributor',
    license: cleanText(info.extmetadata?.LicenseShortName?.value) || 'Xem giấy phép tại nguồn',
    sourceUrl: info.descriptionurl,
  }
}

writeFileSync(
  join(process.cwd(), 'data', 'food-category-images.json'),
  `${JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), visuals }, null, 2)}\n`,
  'utf-8',
)
console.log(JSON.stringify({ imported: Object.keys(visuals).length, source: 'Wikimedia Commons' }, null, 2))
