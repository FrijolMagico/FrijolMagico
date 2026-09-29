import { expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import { useForm } from 'react-hook-form'
import { Window } from 'happy-dom'
mock.module('@/shared/components/date-picker-field', () => ({
  DatePickerField: ({ id, value, onChange }: { id: string; value: string; onChange: (date: string) => void }) =>
    createElement('button', { id, type: 'button', 'data-selected-date': value, onClick: () => {
      // Picker is an adder: click adds date, then clears (value='').
      // Re-armed with a date (value='2026-11-28') allows re-adding that date.
      if (value === '' || value === '2026-11-28') onChange('2026-11-28')
    } }, 'Seleccionar 28/11/2026')
}))
const { ActivityOccurrenceFields } = await import('@/core/eventos/participaciones/_components/activity-occurrence-fields')
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { activityOccurrencesSchema } from '@/core/eventos/participaciones/_schemas/activity.schema'

const window = new Window()
globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.Node = window.Node as typeof Node
globalThis.HTMLElement = window.HTMLElement as typeof HTMLElement
globalThis.HTMLInputElement = window.HTMLInputElement as typeof HTMLInputElement
globalThis.Element = window.Element as typeof Element
globalThis.Event = window.Event as typeof Event
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')

function Schedule({
  initial = [],
  registrationEnabled = false
}: {
  initial?: NonNullable<ActivityFormInput['occurrences']>
  registrationEnabled?: boolean
}) {
  const methods = useForm<ActivityFormInput>({ defaultValues: { occurrences: initial } })
  return createElement('form', null,
    createElement(ActivityOccurrenceFields, { methods, disabled: false, registrationEnabled }),
    createElement('button', { type: 'button', onClick: () => methods.setError('occurrences.0.durationMinutes', { message: 'La duración debe ser positiva' }) }, 'Mostrar error'),
    createElement('output', { 'data-values': true }, JSON.stringify(methods.watch('occurrences')))
  )
}

async function render(
  initial?: NonNullable<ActivityFormInput['occurrences']>,
  registrationEnabled = false
) {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(Schedule, { initial, registrationEnabled })))
  return { container, dispose: async () => { await act(async () => root.unmount()); container.remove() } }
}

async function click(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.getAttribute('aria-label') === label || item.textContent === label)
  expect(button).toBeDefined()
  await act(async () => (button as HTMLButtonElement).click())
}

async function enter(input: HTMLInputElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(input, text)
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}

test('editing an existing occurrence never leaves its previous valid start in RHF', async () => {
  const { container, dispose } = await render([
    { date: '2026-11-28', startTime: '10:30', durationMinutes: 60 }
  ])
  const hour = container.querySelector<HTMLInputElement>('input[id^="occurrence-time-"][id$="-hour"]')!
  const minute = container.querySelector<HTMLInputElement>('input[id^="occurrence-time-"][id$="-minute"]')!
  for (const [input, text, expected] of [
    [hour, '2', '2:30'], [hour, '24', '24:30'], [hour, '10', '10:30'],
    [minute, '60', '10:60'], [minute, '', '10:'], [hour, '', '']
  ] as const) {
    await enter(input, text)
    const current = JSON.parse(container.querySelector('output')!.textContent!)
    expect(current[0].startTime).toBe(expected)
    expect(activityOccurrencesSchema.safeParse(current).success).toBe(
      expected === '10:30' || expected === ''
    )
  }
  await dispose()
})

test('activity session minute arrows use one-minute steps across midnight', async () => {
  const { container, dispose } = await render([
    { date: '2026-11-28', startTime: '23:59', durationMinutes: 1 }
  ])
  const minute = container.querySelector<HTMLInputElement>('input[id^="occurrence-time-"][id$="-minute"]')!
  await act(async () => minute.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'ArrowUp', bubbles: true, cancelable: true
  })))
  expect(container.querySelector('output')?.textContent).toContain('"startTime":"00:00"')
  await act(async () => minute.dispatchEvent(new window.WheelEvent('wheel', {
    deltaY: 1, bubbles: true, cancelable: true
  })))
  expect(container.querySelector('output')?.textContent).toContain('"startTime":"23:59"')
  await dispose()
})

test('empty schedule uses shared date picker without a separate add-date button', async () => {
  const { container, dispose } = await render()
  expect(container.querySelector('#occurrence-new-date')?.tagName).toBe('BUTTON')
  expect(container.querySelector('input[type="date"], input[type="time"]')).toBeNull()
  expect(container.textContent).not.toContain('Agregar fecha')
  expect(container.querySelector('output')?.textContent).toBe('[]')
  await dispose()
})

test('prepopulated dates collapse and expand, preserving indexed sessions and visible errors', async () => {
  const { container, dispose } = await render([
    { date: '2026-11-28', startTime: '10:00', durationMinutes: 60 },
    { date: '2026-11-28', startTime: '13:00', durationMinutes: 45 },
    { date: '2027-01-02', startTime: '09:00', durationMinutes: 30 }
  ])
  expect(container.querySelectorAll('input[type="time"]')).toHaveLength(0)
  expect(container.querySelector('#occurrence-time-' + 'unused')).toBeNull()
  expect(container.querySelectorAll('input[id^="occurrence-time-"][id$="-hour"]')).toHaveLength(3)
  expect(container.querySelector('label[for^="occurrence-time-"]')?.textContent).toBe('Inicio')
  const toggle = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('28 nov 2026'))!
  await act(async () => toggle.click())
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(container.querySelector('#' + toggle.getAttribute('aria-controls'))?.hasAttribute('hidden')).toBe(true)
  await click(container, 'Mostrar error')
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  const duration = container.querySelector<HTMLInputElement>('input[type="number"]')!
  expect(duration.getAttribute('aria-invalid')).toBe('true')
  expect(document.getElementById(duration.getAttribute('aria-describedby')!)?.textContent).toContain('La duración debe ser positiva')
  await click(container, 'Quitar sesión 2 del 2026-11-28')
  expect(container.querySelector('output')?.textContent).toContain('2027-01-02')
  await click(container, 'Quitar fecha 2026-11-28')
  expect(container.querySelector('output')?.textContent).not.toContain('2026-11-28')
  await dispose()
})

test('removing the last session re-arms the picker to select the same date again', async () => {
  const { container, dispose } = await render()
  const picker = container.querySelector<HTMLButtonElement>('#occurrence-new-date')!
  await act(async () => picker.click())
  // Picker clears immediately after adding
  expect(picker.getAttribute('data-selected-date')).toBe('')
  expect(container.querySelectorAll('[aria-controls^="occurrence-date-"]')).toHaveLength(1)
  await click(container, 'Quitar sesión 1 del 2026-11-28')
  expect(container.querySelector('output')?.textContent).toBe('[]')
  // Removing last session re-arms picker with that date
  expect(picker.getAttribute('data-selected-date')).toBe('2026-11-28')
  await act(async () => picker.click())
  expect(container.querySelectorAll('[aria-controls^="occurrence-date-"]')).toHaveLength(1)
  expect(container.querySelector('output')?.textContent).toContain('2026-11-28')
  await dispose()
})

test('removing one of multiple sessions retains the date and other indexed dates', async () => {
  const { container, dispose } = await render([
    { date: '2026-11-28', startTime: '10:00', durationMinutes: 60 },
    { date: '2026-11-28', startTime: '12:00', durationMinutes: 30 },
    { date: '2027-01-02', startTime: '09:00', durationMinutes: 45 }
  ])
  await act(async () => container.querySelector<HTMLButtonElement>('#occurrence-new-date')!.click())
  await click(container, 'Quitar sesión 1 del 2026-11-28')
  expect(container.querySelector('#occurrence-new-date')?.getAttribute('data-selected-date')).toBe('2026-11-28')
  expect(container.querySelector('output')?.textContent).toContain('12:00')
  expect(container.querySelector('output')?.textContent).toContain('2027-01-02')
  expect(container.querySelectorAll('[aria-controls^="occurrence-date-"]')).toHaveLength(2)
  await dispose()
})

test('occurrence URL fields hydrate custom URLs and preserve database IDs', async () => {
  const { container, dispose } = await render([
    {
      id: 81,
      date: '2026-11-28',
      startTime: null,
      durationMinutes: null,
      url: 'https://example.org/custom'
    }
  ], true)
  const url = container.querySelector<HTMLInputElement>('[name="occurrences.0.url"]')
  expect(url?.value).toBe('https://example.org/custom')
  const submitted = JSON.parse(container.querySelector('output')!.textContent!)
  expect(submitted[0]).toMatchObject({
    id: 81,
    url: 'https://example.org/custom',
    date: '2026-11-28'
  })
  expect(submitted[0].rhfId).toBeUndefined()
  await dispose()
})

test('add session opens existing date without duplicating its heading', async () => {
  const { container, dispose } = await render([{ date: '2026-11-28', startTime: '10:00', durationMinutes: 60 }])
  await click(container, 'Agregar sesión el 2026-11-28')
  expect(container.querySelectorAll('[aria-controls^="occurrence-date-"]')).toHaveLength(1)
  expect(container.querySelectorAll('input[id^="occurrence-time-"][id$="-hour"]')).toHaveLength(2)
  await dispose()
})
