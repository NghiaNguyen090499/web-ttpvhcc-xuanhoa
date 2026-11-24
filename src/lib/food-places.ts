import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '@/lib/db'
import type { FoodPlace, FoodPlaceCategory, FoodPlacesContent } from '@/types/food-place'

export const FOOD_PLACES_FILE = join(process.cwd(), 'data', 'food-places.json')
export const FOOD_PLACES_PAGE_KEY = 'food-places'

const CATEGORIES = new Set<FoodPlaceCategory>([
  'restaurant', 'cafe', 'bakery', 'vegetarian', 'takeaway', 'other',
])

function stringValue(value: unknown, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function optionalString(value: unknown, maxLength = 500) {
  const result = stringValue(value, maxLength)
  return result || undefined
}

function numberValue(value: unknown, fallback = 0) {
  const result = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(result) ? result : fallback
}

export function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    const supportedHost = (
      hostname === 'maps.google.com'
      || hostname === 'www.google.com'
      || hostname === 'google.com'
      || hostname === 'maps.app.goo.gl'
      || hostname === 'goo.gl'
    )
    return url.protocol === 'https:' && supportedHost && (
      hostname === 'maps.google.com'
      || hostname.includes('goo.gl')
      || url.pathname.startsWith('/maps')
    )
  } catch {
    return false
  }
}

export function isSafeImageUrl(value: string) {
  if (value.startsWith('/uploads/am-thuc/')) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isSafeExternalUrl(value?: string) {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function sanitizeFoodPlace(value: unknown, fallbackId?: string): FoodPlace | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const name = stringValue(input.name, 160)
  const address = stringValue(input.address, 300)
  const summary = stringValue(input.summary, 1200)
  const googleMapsUri = stringValue(input.googleMapsUri, 1000)
  const category = CATEGORIES.has(input.category as FoodPlaceCategory)
    ? input.category as FoodPlaceCategory
    : 'other'
  const imageUrl = optionalString(input.imageUrl, 1000)
  const imageSourceUrl = optionalString(input.imageSourceUrl, 1000)
  const sourceUrl = optionalString(input.sourceUrl, 1000)
  const latitudeInput = input.latitude == null ? undefined : numberValue(input.latitude)
  const longitudeInput = input.longitude == null ? undefined : numberValue(input.longitude)
  const ratingInput = input.rating === '' || input.rating == null ? undefined : numberValue(input.rating)
  const countInput = input.userRatingCount === '' || input.userRatingCount == null
    ? undefined
    : Math.max(0, Math.round(numberValue(input.userRatingCount)))

  if (!name || !address || !summary || !isGoogleMapsUrl(googleMapsUri)) return null
  if (imageUrl && !isSafeImageUrl(imageUrl)) return null
  if (!isSafeExternalUrl(imageSourceUrl)) return null
  if (!isSafeExternalUrl(sourceUrl)) return null
  if (ratingInput !== undefined && (ratingInput < 0 || ratingInput > 5)) return null
  if (latitudeInput !== undefined && (latitudeInput < -90 || latitudeInput > 90)) return null
  if (longitudeInput !== undefined && (longitudeInput < -180 || longitudeInput > 180)) return null

  return {
    id: stringValue(input.id, 100) || fallbackId || `food-${Date.now()}`,
    name,
    address,
    summary,
    category,
    googleMapsUri,
    imageUrl,
    imageAlt: optionalString(input.imageAlt, 300) || (imageUrl ? `Ảnh ${name}` : undefined),
    imageCredit: optionalString(input.imageCredit, 200),
    imageSourceUrl,
    rating: ratingInput,
    userRatingCount: countInput,
    priceLabel: optionalString(input.priceLabel, 100),
    openingHours: optionalString(input.openingHours, 300),
    phone: optionalString(input.phone, 50),
    latitude: latitudeInput,
    longitude: longitudeInput,
    sourceName: optionalString(input.sourceName, 100),
    sourceUrl,
    isFeatured: input.isFeatured === true,
    isActive: input.isActive !== false,
    sortOrder: Math.round(numberValue(input.sortOrder)),
    reviewedAt: optionalString(input.reviewedAt, 10),
  }
}

export function sanitizeFoodPlacesContent(value: unknown): FoodPlacesContent {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const rawItems = Array.isArray(input.items) ? input.items : []
  const items = rawItems
    .map((item, index) => sanitizeFoodPlace(item, `food-${index + 1}`))
    .filter((item): item is FoodPlace => Boolean(item))

  return {
    updatedAt: stringValue(input.updatedAt, 10) || new Date().toISOString().slice(0, 10),
    items,
  }
}

export function getStaticFoodPlacesContent(): FoodPlacesContent {
  try {
    return sanitizeFoodPlacesContent(JSON.parse(readFileSync(FOOD_PLACES_FILE, 'utf-8')))
  } catch {
    return { updatedAt: new Date().toISOString().slice(0, 10), items: [] }
  }
}

export async function getFoodPlacesContent(): Promise<FoodPlacesContent> {
  const fallback = getStaticFoodPlacesContent()
  if (!prisma) return fallback

  try {
    const content = await prisma.pageContent.findUnique({
      where: { pageKey: FOOD_PLACES_PAGE_KEY },
      select: { metadata: true },
    })
    return content?.metadata ? sanitizeFoodPlacesContent(content.metadata) : fallback
  } catch (error) {
    console.warn('[FoodPlaces] Dùng dữ liệu JSON dự phòng:', error)
    return fallback
  }
}
