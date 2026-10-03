import {
  compareActiveFestivalDisplay,
  type ActiveFestivalDisplay
} from '@frijolmagico/database/active-festival-display'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'

export async function invalidateActiveFestivalDisplay(
  before: ActiveFestivalDisplay | null,
  after: ActiveFestivalDisplay | null,
  deliver: (tag: string) => Promise<unknown> = (tag) =>
    revalidateWebCache({ tag, mode: 'immediate' }),
  log: (message: string, details: { tag: string }) => void = (message, details) =>
    console.error(message, details)
): Promise<void> {
  if (!compareActiveFestivalDisplay(before, after)) return

  try {
    await deliver(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)
  } catch {
    log('[active-festival-display] Web cache sync failed', {
      tag: FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG
    })
  }
}
