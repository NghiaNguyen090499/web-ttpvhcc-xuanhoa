// Matches the previous directive speed: 28s for 10 items.
const VERTICAL_MARQUEE_SECONDS_PER_ITEM = 2.8

export function getVerticalMarqueeDuration(itemCount: number): string {
  return `${Math.max(itemCount, 1) * VERTICAL_MARQUEE_SECONDS_PER_ITEM}s`
}
