import '../../../../../../../test-setup'

import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { FESTIVAL_ANIMATION_TIMING } from '../../lib/festival-animation-timing'
import { ActiveFestivalDetailAnimation } from './active-festival-detail-animation'
import type { FestivalAnimationAdapter } from '../../hooks/use-festival-detail-animations'

afterEach(cleanup)

interface Call {
  method: 'set' | 'to' | 'from'
  target: unknown
  vars?: Record<string, unknown>
  position?: number
}

function createRecorder() {
  const calls: Call[] = []
  const completions: Array<() => void> = []
  const timers = new Map<number, () => void>()
  let id = 0
  let killed = 0
  const timeline = (options?: { onComplete?: () => void }) => {
    if (options?.onComplete) completions.push(options.onComplete)
    const result = {
      to(target: unknown, vars: Record<string, unknown>, position?: number) {
        calls.push({ method: 'to', target, vars, position })
        return result
      },
      from(target: unknown, vars: Record<string, unknown>, position?: number) {
        calls.push({ method: 'from', target, vars, position })
        return result
      },
      fromTo(
        target: unknown,
        _from: Record<string, unknown>,
        vars: Record<string, unknown>,
        position?: number
      ) {
        calls.push({ method: 'to', target, vars, position })
        return result
      },
      kill() {
        killed += 1
      }
    }
    return result
  }
  const adapter: FestivalAnimationAdapter = {
    set: (target, vars) => calls.push({ method: 'set', target, vars }),
    timeline,
    schedule: (callback) => {
      const timer = id++
      timers.set(timer, callback)
      return timer
    },
    clearSchedule: (timer) => timers.delete(timer),
    reducedMotion: () => false,
    measure: () => ({ width: 120, height: 24 }) as DOMRect,
    readStorage: () => [],
    writeStorage: () => undefined
  }
  return {
    adapter,
    calls,
    complete: () => completions.splice(0).forEach((callback) => callback()),
    runTimers: () => timers.forEach((callback) => callback()),
    killed: () => killed
  }
}

function Fixture({
  adapter,
  items = ['Uno', 'Dos', 'Tres']
}: {
  adapter: FestivalAnimationAdapter
  items?: string[]
}) {
  return (
    <ActiveFestivalDetailAnimation slug='festival-a' animationAdapter={adapter}>
      <header data-festival-entry='header'>Header</header>
      <aside data-festival-entry='poster'>Poster</aside>
      <section data-festival-entry='participants' data-spoiler-category='arte'>
        {items.map((name) => (
          <span data-spoiler-item key={name} role='button' tabIndex={0}>
            <a
              data-spoiler-link
              href={`/catalogo/${name}`}
              className='pointer-events-none'
              tabIndex={-1}
              aria-disabled='true'
            >
              <span data-spoiler-content className='relative inline-flex'>
                <span data-spoiler-text>{name}</span>
                <span data-spoiler-icon>→</span>
                <span
                  data-spoiler-redaction
                  aria-hidden='true'
                  className='bg-primary absolute inset-0 origin-left rounded'
                />
              </span>
            </a>
          </span>
        ))}
      </section>
      <details>
        <summary>Actividad</summary>
        <p>Contenido</p>
      </details>
    </ActiveFestivalDetailAnimation>
  )
}

describe('ActiveFestivalDetailAnimation redaction bars', () => {
  test('reveals bars right-to-left with stagger from timing constants and conceals them in reverse', () => {
    const { ITEM_DURATION_MS, ITEM_STAGGER_MS } = FESTIVAL_ANIMATION_TIMING
    const revealDuration = ITEM_DURATION_MS / 1000
    const stagger = ITEM_STAGGER_MS / 1000
    const fadeDuration = (ITEM_DURATION_MS * 0.25) / 1000
    const fadeOffset = (ITEM_DURATION_MS * 0.7) / 1000

    const recorder = createRecorder()
    render(<Fixture adapter={recorder.adapter} />)
    fireEvent.click(screen.getByText('Uno'))
    const reveal = recorder.calls.filter(
      (call) =>
        call.method === 'to' &&
        call.target instanceof HTMLElement &&
        call.target.dataset.spoilerRedaction !== undefined &&
        call.vars?.width === '0%'
    )
    expect(
      reveal.map((call) => [
        call.vars?.width,
        call.vars?.duration,
        call.vars?.transformOrigin,
        call.position
      ])
    ).toEqual([
      ['0%', revealDuration, 'left center', 0],
      ['0%', revealDuration, 'left center', stagger],
      ['0%', revealDuration, 'left center', 2 * stagger]
    ])
    const fade = recorder.calls.filter(
      (call) =>
        call.method === 'to' &&
        call.target instanceof HTMLElement &&
        call.target.dataset.spoilerRedaction !== undefined &&
        call.vars?.opacity === 0
    )
    expect(fade.map((call) => [call.vars?.duration, call.position])).toEqual([
      [fadeDuration, fadeOffset],
      [fadeDuration, fadeOffset + stagger],
      [fadeDuration, fadeOffset + 2 * stagger]
    ])
    recorder.complete()
    recorder.runTimers()
    fireEvent.click(
      screen.getByRole('button', { name: 'Ocultar participantes' })
    )
    const conceal = recorder.calls
      .filter(
        (call) =>
          call.method === 'to' &&
          call.target instanceof HTMLElement &&
          call.target.dataset.spoilerRedaction !== undefined
      )
      .slice(-3)
    expect(
      conceal.map((call) => [
        (call.target as HTMLElement).parentElement?.querySelector(
          '[data-spoiler-text]'
        )?.textContent,
        call.vars?.width,
        call.position
      ])
    ).toEqual([
      ['Tres', '100%', 0],
      ['Dos', '100%', stagger],
      ['Uno', '100%', 2 * stagger]
    ])
    expect(
      recorder.calls.filter(
        (call) =>
          call.method === 'set' &&
          Array.isArray(call.target) &&
          call.target.every(
            (target) =>
              target instanceof HTMLElement &&
              target.dataset.spoilerRedaction !== undefined
          ) &&
          call.vars?.opacity === 1
      )
    ).toHaveLength(6)
  })

  test('runs header, poster, then participant-section entry stages using entry duration constant', () => {
    const entryDuration = FESTIVAL_ANIMATION_TIMING.ENTRY_DURATION_MS / 1000

    const recorder = createRecorder()
    render(<Fixture adapter={recorder.adapter} />)

    const entryStages = recorder.calls.filter(
      (call) =>
        call.method === 'from' &&
        call.target instanceof HTMLElement &&
        call.target.dataset.festivalEntry !== undefined
    )

    expect(
      entryStages.map((call) => [
        (call.target as HTMLElement).dataset.festivalEntry,
        call.vars?.duration
      ])
    ).toEqual([
      ['header', entryDuration],
      ['poster', entryDuration],
      ['participants', entryDuration]
    ])
  })

  test('blocks links until their category is fully revealed, including an active spoiler lock', () => {
    const recorder = createRecorder()
    render(<Fixture adapter={recorder.adapter} items={['Uno']} />)
    const link = screen.getByRole('link', { name: /Uno/ })
    expect(
      recorder.calls.some(
        (call) =>
          call.method === 'set' &&
          call.target === link &&
          call.vars?.pointerEvents === 'none'
      )
    ).toBe(true)
    for (const expected of [true, true]) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      link.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(expected)
    }
    recorder.complete()
    recorder.runTimers()
    expect(
      recorder.calls.some(
        (call) =>
          call.method === 'set' &&
          call.target === link &&
          call.vars?.pointerEvents === 'auto'
      )
    ).toBe(true)
    const revealed = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    link.dispatchEvent(revealed)
    expect(revealed.defaultPrevented).toBe(false)
  })

  test('uses one existing bar per item, leaves activities usable, and cleans up', () => {
    const recorder = createRecorder()
    const { container, unmount } = render(
      <Fixture adapter={recorder.adapter} />
    )
    expect(container.querySelectorAll('[data-spoiler-redaction]')).toHaveLength(
      3
    )
    fireEvent.click(screen.getByText('Uno'))
    recorder.complete()
    recorder.runTimers()
    fireEvent.click(
      screen.getByRole('button', { name: 'Ocultar participantes' })
    )
    recorder.complete()
    recorder.runTimers()
    expect(container.querySelectorAll('[data-spoiler-redaction]')).toHaveLength(
      3
    )
    fireEvent.click(screen.getByText('Actividad'))
    expect(container.querySelector('details')?.open).toBe(true)
    unmount()
    expect(recorder.killed()).toBeGreaterThan(0)
  })
})
