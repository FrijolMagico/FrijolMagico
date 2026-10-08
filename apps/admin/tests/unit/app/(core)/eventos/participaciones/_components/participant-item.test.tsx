import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      selectedExhibition: { exhibition: null },
      selectedActivity: { activity: null },
      setSelectedParticipant: () => {}
    })
}))

function mockItemComponent(tag: string) {
  return ({ children }: { children: ReactNode }) => createElement(tag, null, children)
}

mock.module('@/shared/components/ui/item', () => ({
  Item: mockItemComponent('div'),
  ItemContent: mockItemComponent('section'),
  ItemDescription: mockItemComponent('p'),
  ItemMedia: mockItemComponent('span'),
  ItemTitle: mockItemComponent('h2')
}))

const { ParticipantItem } = await import(
  '@/core/eventos/participaciones/_components/participant-item'
)

describe('ParticipantItem contextual pseudonym', () => {
  test('shows the selected exhibition/activity pseudonym, not the primary name', () => {
    const markup = renderToStaticMarkup(
      createElement(ParticipantItem, {
        entity: {
          artist: {
            id: 9,
            pseudonym: 'Primary Name',
            statusId: 1,
            pseudonyms: [
              { id: 90, pseudonym: 'Primary Name', isPrimary: true },
              { id: 91, pseudonym: 'Contextual Name', isPrimary: false }
            ]
          },
          collective: null,
          band: null
        },
        participation: {
          id: 4,
          pseudonimoId: 91,
          disciplinaId: 1
        } as never
      })
    )

    expect(markup).toContain('Contextual Name')
    expect(markup).not.toContain('Primary Name')
  })

  test('falls back to the artist primary pseudonym when the detail has no selection', () => {
    const markup = renderToStaticMarkup(
      createElement(ParticipantItem, {
        entity: {
          artist: {
            id: 9,
            pseudonym: 'Primary Name',
            statusId: 1,
            pseudonyms: [{ id: 90, pseudonym: 'Primary Name', isPrimary: true }]
          },
          collective: null,
          band: null
        },
        participation: { id: 4, pseudonimoId: null, disciplinaId: 1 } as never
      })
    )

    expect(markup).toContain('Primary Name')
  })
})
