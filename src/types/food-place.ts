export type FoodPlaceCategory = 'restaurant' | 'cafe' | 'bakery' | 'vegetarian' | 'takeaway' | 'other'

export type FoodPlace = {
  id: string
  name: string
  address: string
  summary: string
  category: FoodPlaceCategory
  googleMapsUri: string
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  imageSourceUrl?: string
  rating?: number
  userRatingCount?: number
  priceLabel?: string
  openingHours?: string
  phone?: string
  latitude?: number
  longitude?: number
  sourceName?: string
  sourceUrl?: string
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  reviewedAt?: string
}

export type FoodPlacesContent = {
  updatedAt: string
  items: FoodPlace[]
}
