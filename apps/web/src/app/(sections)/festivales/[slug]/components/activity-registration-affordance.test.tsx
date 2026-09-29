import { afterEach, describe, expect, jest, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

import { ActivityRegistrationCta } from './activity-registration-affordance'

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('ActivityRegistrationCta', () => {
  test('uses only the occurrence URL when the shared registration window is open', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    render(
      <ActivityRegistrationCta
        registration={{
          start_at: '2026-09-05T16:30:00.000Z',
          end_at: '2026-09-05T17:30:00.000Z'
        }}
        url='https://example.org/occurrence'
      />
    )
    expect(screen.getByRole('link', { name: 'Inscríbete' }).getAttribute('href')).toBe(
      'https://example.org/occurrence'
    )
  })

  test('fails closed for a missing occurrence URL or a closed shared window', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:00:00.000Z'))
    const props = {
      registration: {
        start_at: '2026-09-05T16:30:00.000Z',
        end_at: '2026-09-05T17:30:00.000Z'
      }
    }
    const { rerender } = render(<ActivityRegistrationCta {...props} url={null} />)
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
    rerender(
      <ActivityRegistrationCta
        {...props}
        url='https://example.org/occurrence'
      />
    )
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })
})
