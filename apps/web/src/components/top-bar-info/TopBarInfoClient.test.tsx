import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { TopBarInfoClient } from './TopBarInfoClient'

describe('TopBarInfoClient', () => {
  test('keeps the active CTA inside the top bar as a focused semantic link', () => {
    const html = renderToStaticMarkup(
      <TopBarInfoClient
        data={{
          text: 'Festival',
          button: { active: true, text: 'Participa', href: '/participa' }
        }}
      />
    )

    expect(html).toContain('aria-label="Frijol Mágico"')
    expect(html).toContain('href="/participa"')
    expect(html).toContain('>Participa</a>')
    expect(html).toContain('focus-visible:ring-2')
    expect(html).not.toContain('<button')
  })

  test('maintenance mode suppresses internal CTAs without changing the generic default', () => {
    const html = renderToStaticMarkup(
      <TopBarInfoClient
        data={{
          text: 'Festival',
          button: { active: true, text: 'Participa', href: '/participa' }
        }}
        disableInternalCta
      />
    )

    expect(html).not.toContain('href="/participa"')
    expect(html).not.toContain('>Participa</a>')
  })

  test('does not insert an inactive CTA', () => {
    const html = renderToStaticMarkup(
      <TopBarInfoClient
        data={{
          text: 'Festival',
          button: { active: false, text: 'Participa' }
        }}
      />
    )

    expect(html).not.toContain('>Participa</a>')
  })
})
