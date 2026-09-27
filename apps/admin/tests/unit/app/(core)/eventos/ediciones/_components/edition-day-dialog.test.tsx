import { expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  DialogContent: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  DialogFooter: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) => createElement('h2', null, children)
}))
mock.module('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectValue: ({ children }: { children: React.ReactNode }) => createElement('span', null, children),
  SelectContent: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectItem: ({ children }: { children: React.ReactNode }) => createElement('span', null, children)
}))
mock.module('@/core/eventos/ediciones/_components/place-combobox', () => ({
  LugarCombobox: () => createElement('div')
}))
const { EdicionDayDialog } = await import('@/core/eventos/ediciones/_components/edition-day-dialog')

test('edition day renders canonical start and end times as editable segments', () => {
  const markup = renderToStaticMarkup(createElement(EdicionDayDialog, {
    open: true, onClose: () => {}, onSave: () => {}, lugares: [],
    initialDay: {
      tempId: 'day', fecha: '2026-07-01', horaInicio: '09:05', horaFin: '10:30',
      modalidad: 'online', lugarId: null
    }
  }))
  expect(markup).toContain('id="dia-hora-inicio-hour"')
  expect(markup).toContain('id="dia-hora-fin-minute"')
  expect(markup).toContain('value="09"')
  expect(markup).toContain('value="05"')
  expect(markup).toContain('value="30"')
  expect(markup).not.toContain('Seleccionar hora')
})
