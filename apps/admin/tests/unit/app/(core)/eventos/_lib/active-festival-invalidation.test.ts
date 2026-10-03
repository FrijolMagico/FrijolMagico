import { describe, expect, mock, test } from 'bun:test'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import {
  compareActiveFestivalDisplay,
  type ActiveFestivalDisplay
} from '@frijolmagico/database/active-festival-display'

const display: ActiveFestivalDisplay = {
  id: 1,
  slug: 'festival-i',
  event_name: 'Festival',
  edition_number: 'I',
  start_date: '2026-10-01',
  end_date: '2026-10-02',
  days: [{ fecha: '2026-10-01', lugar: 'Plaza' }]
}

describe('active festival display comparison', () => {
  test('detects a changed selection and null transitions', () => {
    expect(compareActiveFestivalDisplay(display, { ...display, id: 2 })).toBe(true)
    expect(compareActiveFestivalDisplay(null, display)).toBe(true)
    expect(compareActiveFestivalDisplay(display, null)).toBe(true)
  })

  test('treats an equal projection as unchanged', () => {
    expect(compareActiveFestivalDisplay(display, { ...display, days: [...display.days] })).toBe(false)
  })
})

describe('active festival display invalidation', () => {
  test('awaits delivery of the dedicated tag and preserves the write on delivery failure', async () => {
    const deliver = mock(async () => {
      throw new Error('delivery unavailable')
    })
    const log = mock(() => {})
    const { invalidateActiveFestivalDisplay } = await import(
      '@/core/eventos/_lib/active-festival-invalidation'
    )

    await invalidateActiveFestivalDisplay(display, null, deliver, log)

    expect(deliver).toHaveBeenCalledWith(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)
    expect(deliver).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledTimes(1)
  })

  test('does not deliver for unchanged projections', async () => {
    const deliver = mock(async () => {})
    const { invalidateActiveFestivalDisplay } = await import(
      '@/core/eventos/_lib/active-festival-invalidation'
    )

    await invalidateActiveFestivalDisplay(display, { ...display }, deliver, mock(() => {}))

    expect(deliver).not.toHaveBeenCalled()
  })
})
