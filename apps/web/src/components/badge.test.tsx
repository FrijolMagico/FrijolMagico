import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Badge } from './badge'

describe('Badge', () => {
  test('renders caller-supplied content with the default badge presentation', () => {
    const html = renderToStaticMarkup(<Badge>Nuevo!</Badge>)
    const badge = html.match(/<span class="([^"]*)">Nuevo!<\/span>/)

    expect(badge).not.toBeNull()
    expect(badge?.[1]).toBeTruthy()
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex=')
    expect(html).not.toContain('<button')
  })

  test('supports caller-provided color, background, outline, and class customization', () => {
    const html = renderToStaticMarkup(
      <Badge
        color='text-palette-foreground'
        backgroundColor='bg-palette-primary'
        outlineColor='outline-palette-primary'
        className='-top-2 left-4'
      >
        Abierto
      </Badge>
    )

    expect(html).toContain('>Abierto</span>')
    expect(html).toContain('text-palette-foreground')
    expect(html).toContain('bg-palette-primary')
    expect(html).toContain('outline-palette-primary')
    expect(html).toContain('-top-2')
    expect(html).toContain('left-4')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex=')
    expect(html).not.toContain('<button')
  })
})
