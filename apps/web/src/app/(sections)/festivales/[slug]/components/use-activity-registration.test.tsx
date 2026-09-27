import '../../../../../../test-setup'

import { afterEach, describe, expect, jest, test } from 'bun:test'
import { act, cleanup, render, screen } from '@testing-library/react'

import { useActivityRegistration } from './use-activity-registration'

import type { ActivityRegistration } from '../../types/festival'

const start = Date.parse('2026-09-05T16:30:00.000Z')
const registration: ActivityRegistration = {
  url: 'https://example.org/signup',
  start_at: new Date(start).toISOString(),
  end_at: new Date(start + 1000).toISOString()
}

function Probe({ value }: { value: ActivityRegistration | null }) {
  return <span>{useActivityRegistration(value) ? 'active' : 'hidden'}</span>
}

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('useActivityRegistration', () => {
  test('schedules start and inclusive end transitions without polling', () => {
    jest.useFakeTimers()
    jest.setSystemTime(start - 1)
    render(<Probe value={registration} />)
    expect(screen.getByText('hidden')).toBeDefined()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByText('active')).toBeDefined()
    act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText('active')).toBeDefined()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByText('hidden')).toBeDefined()
    expect(jest.getTimerCount()).toBe(0)
  })

  test('reconciles on focus and visibility, and cleans up on input change and unmount', () => {
    jest.useFakeTimers()
    jest.setSystemTime(start - 1)
    const { rerender, unmount } = render(<Probe value={registration} />)
    jest.setSystemTime(start + 500)
    act(() => window.dispatchEvent(new window.Event('focus')))
    expect(screen.getByText('active')).toBeDefined()
    rerender(<Probe value={null} />)
    expect(screen.getByText('hidden')).toBeDefined()
    expect(jest.getTimerCount()).toBe(0)
    rerender(<Probe value={registration} />)
    expect(screen.getByText('active')).toBeDefined()
    jest.setSystemTime(start + 1001)
    act(() => document.dispatchEvent(new window.Event('visibilitychange')))
    expect(screen.getByText('hidden')).toBeDefined()
    unmount()
    expect(jest.getTimerCount()).toBe(0)
  })

  test('removes the exact focus and visibility callbacks on input change and unmount', () => {
    jest.useFakeTimers()
    jest.setSystemTime(start - 1)
    const addFocus = jest.spyOn(window, 'addEventListener')
    const removeFocus = jest.spyOn(window, 'removeEventListener')
    const addVisibility = jest.spyOn(document, 'addEventListener')
    const removeVisibility = jest.spyOn(document, 'removeEventListener')
    try {
      const { rerender, unmount } = render(<Probe value={registration} />)
      const firstFocus = addFocus.mock.calls.find(
        ([type]) => type === 'focus'
      )?.[1]
      const firstVisibility = addVisibility.mock.calls.find(
        ([type]) => type === 'visibilitychange'
      )?.[1]
      expect(firstFocus).toBeDefined()
      expect(firstVisibility).toBeDefined()

      const changed = {
        ...registration,
        end_at: new Date(start + 2000).toISOString()
      }
      rerender(<Probe value={changed} />)
      expect(removeFocus).toHaveBeenCalledWith('focus', firstFocus)
      expect(removeVisibility).toHaveBeenCalledWith(
        'visibilitychange',
        firstVisibility
      )
      const focusCallbacks = addFocus.mock.calls.filter(
        ([type]) => type === 'focus'
      )
      const visibilityCallbacks = addVisibility.mock.calls.filter(
        ([type]) => type === 'visibilitychange'
      )
      expect(focusCallbacks).toHaveLength(2)
      expect(visibilityCallbacks).toHaveLength(2)
      expect(focusCallbacks[1][1]).not.toBe(firstFocus)
      expect(visibilityCallbacks[1][1]).not.toBe(firstVisibility)

      unmount()
      expect(removeFocus).toHaveBeenCalledWith('focus', focusCallbacks[1][1])
      expect(removeVisibility).toHaveBeenCalledWith(
        'visibilitychange',
        visibilityCallbacks[1][1]
      )
      expect(
        removeFocus.mock.calls.filter(([type]) => type === 'focus')
      ).toHaveLength(2)
      expect(
        removeVisibility.mock.calls.filter(
          ([type]) => type === 'visibilitychange'
        )
      ).toHaveLength(2)
    } finally {
      addFocus.mockRestore()
      removeFocus.mockRestore()
      addVisibility.mockRestore()
      removeVisibility.mockRestore()
    }
  })

  test('an early wake-up rechecks the clock instead of assuming the boundary passed', () => {
    jest.useFakeTimers()
    jest.setSystemTime(start - 1)
    render(<Probe value={registration} />)
    jest.setSystemTime(start - 100)
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByText('hidden')).toBeDefined()
    expect(jest.getTimerCount()).toBe(1)
    act(() => jest.advanceTimersByTime(99))
    expect(screen.getByText('active')).toBeDefined()
  })

  test('chunks very distant boundaries and rechecks the actual clock', () => {
    jest.useFakeTimers()
    jest.setSystemTime(start - 2147483649)
    render(<Probe value={registration} />)
    expect(jest.getTimerCount()).toBe(1)
    act(() => jest.advanceTimersByTime(2147483647))
    expect(screen.getByText('hidden')).toBeDefined()
    act(() => jest.advanceTimersByTime(2))
    expect(screen.getByText('active')).toBeDefined()
  })
})
