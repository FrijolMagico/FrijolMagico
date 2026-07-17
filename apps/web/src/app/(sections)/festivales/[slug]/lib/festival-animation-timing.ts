export const FESTIVAL_ANIMATION_TIMING = {
  ITEM_DURATION_MS: 500,
  ITEM_STAGGER_MS: 200,
  ENTRY_DURATION_MS: 750,
  ENTRY_STAGGER_MS: 150,
  RESTORE_DELAY_MS: 100
} as const

export function getItemStartMs(index: number) {
  return Math.max(0, index) * FESTIVAL_ANIMATION_TIMING.ITEM_STAGGER_MS
}

export function getCategoryDurationMs(itemCount: number) {
  if (itemCount <= 0) return 0

  return (
    FESTIVAL_ANIMATION_TIMING.ITEM_DURATION_MS +
    (itemCount - 1) * FESTIVAL_ANIMATION_TIMING.ITEM_STAGGER_MS
  )
}
