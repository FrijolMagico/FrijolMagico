import { afterAll, afterEach, expect, test } from 'bun:test'
import { act, createElement, useState } from 'react'
import { createHappyDOMEnvironment } from '@/tests/unit/_support/happy-dom-environment'

const environment = await createHappyDOMEnvironment()
const { createRoot: createDOMRoot } = await import('react-dom/client')
const activeRoots = new Set<ReturnType<typeof createDOMRoot>>()

function createRoot(container: HTMLElement) {
  const root = createDOMRoot(container)
  activeRoots.add(root)
  return root
}

afterEach(async () => {
  try {
    for (const root of activeRoots) await act(async () => root.unmount())
  } finally {
    activeRoots.clear()
    document.body.replaceChildren()
  }
})

afterAll(async () => environment.dispose())
const { TimePickerField } = await import('@/shared/components/time-picker-field')

async function setup(initial = '', disabled = false, error?: string) {
  const changes: string[] = []
  let reset: (value: string) => void = () => {}
  function Form() {
    const [value, setValue] = useState(initial)
    reset = setValue
    return createElement('form', null,
      createElement(TimePickerField, { id: 'time', label: 'Inicio', value, disabled, error,
        onChange: (next) => { changes.push(next); setValue(next) } }),
      createElement('input', { type: 'hidden', name: 'startTime', value }),
      createElement('output', null, value))
  }
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(Form)))
  const hour = container.querySelector<HTMLInputElement>('#time-hour')!
  const minute = container.querySelector<HTMLInputElement>('#time-minute')!
  return { container, hour, minute, changes,
    submittedValue: () => new FormData(container.querySelector('form')!).get('startTime'),
    reset: async (value: string) => act(async () => reset(value)),
    dispose: async () => { await act(async () => root.unmount()); activeRoots.delete(root); container.remove() }
  }
}

async function type(input: HTMLInputElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, text)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function key(input: HTMLInputElement, name: string) {
  await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })))
}
async function wheel(input: HTMLInputElement, deltaY: number) {
  await act(async () => input.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })))
}

test('every edit replaces the controlled value, including incomplete and invalid segments', async () => {
  const form = await setup('10:30')
  await type(form.hour, '2')
  expect(form.changes.at(-1)).toBe('2:30')
  expect(form.hour.value).toBe('2')
  expect(form.hour.getAttribute('aria-invalid')).toBe('true')
  expect(document.getElementById('time-hour-error')?.textContent).toContain('dos dígitos')
  await type(form.hour, '24')
  expect(form.changes.at(-1)).toBe('24:30')
  expect(document.getElementById('time-hour-error')?.textContent).toContain('00 y 23')
  await type(form.hour, '23')
  expect(form.changes.at(-1)).toBe('23:30')
  await type(form.minute, '60')
  expect(form.changes.at(-1)).toBe('23:60')
  expect(document.getElementById('time-minute-error')?.textContent).toContain('00 y 59')
  await type(form.minute, '07')
  expect(form.changes.at(-1)).toBe('23:07')
  await type(form.minute, '')
  expect(form.changes.at(-1)).toBe('23:')
  await type(form.hour, '')
  expect(form.changes.at(-1)).toBe('')
  await form.dispose()
})

test('pasting a complete time into either segment replaces the controlled submission value', async () => {
  for (const segment of ['hour', 'minute'] as const) {
    const form = await setup('10:30')
    await type(form[segment], '12:59')
    expect(form.changes.at(-1)).toBe('12:59')
    expect(form.hour.value).toBe('12')
    expect(form.minute.value).toBe('59')
    expect(form.submittedValue()).toBe('12:59')
    expect(form.hour.getAttribute('aria-invalid')).toBe('false')
    expect(form.minute.getAttribute('aria-invalid')).toBe('false')
    await form.dispose()
  }
})

test('malformed colon-containing edits on either segment cannot conceal an invalid submission draft', async () => {
  for (const segment of ['hour', 'minute'] as const) {
    for (const draft of ['12:xx', '12:59:00', '12:99']) {
      const form = await setup('10:30')
      await type(form[segment], draft)
      const submitted = String(form.submittedValue())
      expect(submitted).not.toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)
      expect(form.changes.at(-1)).toBe(submitted)
      expect(`${form.hour.value}:${form.minute.value}`).toBe(submitted)
      expect(form.container.querySelector('[aria-invalid="true"]')).not.toBeNull()
      await form.dispose()
    }
  }
})

test('minute steps are one minute with carry, borrow and midnight wrap', async () => {
  const form = await setup('23:59')
  await wheel(form.minute, -1)
  expect(form.changes.at(-1)).toBe('00:00')
  await key(form.minute, 'ArrowDown')
  expect(form.changes.at(-1)).toBe('23:59')
  await key(form.minute, 'ArrowUp')
  expect(form.changes.at(-1)).toBe('00:00')
  await form.reset('10:01')
  await wheel(form.minute, -1)
  expect(form.changes.at(-1)).toBe('10:02')
  await key(form.minute, 'ArrowDown')
  expect(form.changes.at(-1)).toBe('10:01')
  await form.dispose()
})

test('one-minute controls preserve midnight carry and borrow with wheel and arrows', async () => {
  const form = await setup('23:59')
  await wheel(form.minute, -1)
  expect(form.changes.at(-1)).toBe('00:00')
  await wheel(form.minute, 1)
  expect(form.changes.at(-1)).toBe('23:59')
  await key(form.minute, 'ArrowUp')
  expect(form.changes.at(-1)).toBe('00:00')
  await key(form.hour, 'ArrowDown')
  expect(form.changes.at(-1)).toBe('23:00')
  await wheel(form.hour, -1)
  expect(form.changes.at(-1)).toBe('00:00')
  await form.dispose()
})

test('typed minutes accept arbitrary valid HH:mm with one-minute wheel step', async () => {
  const form = await setup('10:00')
  await type(form.minute, '03')
  expect(form.submittedValue()).toBe('10:03')
  expect(form.minute.getAttribute('aria-invalid')).toBe('false')
  await key(form.minute, 'ArrowUp')
  expect(form.submittedValue()).toBe('10:04')
  await form.dispose()
})

test('controlled reset discards stale draft; empty and disabled controls remain accessible', async () => {
  const form = await setup('08:40', false, 'Hora obligatoria')
  expect(form.minute.getAttribute('aria-describedby')).toContain('time-error')
  expect(form.minute.getAttribute('aria-invalid')).toBe('true')
  await type(form.minute, '9')
  expect(form.changes.at(-1)).toBe('08:9')
  await form.reset('08:40')
  expect(form.minute.value).toBe('40')
  await type(form.minute, '9')
  await form.reset('12:05')
  expect(form.minute.value).toBe('05')
  await type(form.hour, '')
  await type(form.minute, '')
  expect(form.changes.at(-1)).toBe('')
  await form.dispose()
  const disabled = await setup('10:15', true)
  expect(disabled.hour.disabled).toBe(true)
  expect(disabled.minute.disabled).toBe(true)
  await wheel(disabled.minute, -1)
  await key(disabled.hour, 'ArrowUp')
  expect(disabled.changes).toEqual([])
  await disabled.dispose()
})
