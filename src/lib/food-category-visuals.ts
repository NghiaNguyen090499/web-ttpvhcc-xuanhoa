import data from '../../data/food-category-images.json'
import type { FoodPlaceCategory } from '@/types/food-place'

export type FoodCategoryVisual = {
  imageUrl: string
  alt: string
  credit: string
  license: string
  sourceUrl: string
}

export const FOOD_CATEGORY_VISUALS = data.visuals as Record<FoodPlaceCategory, FoodCategoryVisual>
