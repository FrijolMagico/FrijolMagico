import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Badge } from './badge'

describe('Badge', () => {
  test('keeps the tilted, outlined legacy presentation with caller-supplied content', () => {
    const html = renderToStaticMarkup(<Badge variant='new'>Nuevo!</Badge>)

    expect(html).toContain('>Nuevo!</span>')
    expect(html).toContain('-rotate-6')
    expect(html).toContain('rounded-md')
    expect(html).toContain('outline-2')
    expect(html).toContain('text-primary')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex=')
    expect(html).not.toContain('<button')
  })

  test('renders registration content as non-interactive brand text without a fixed label', () => {
    const html = renderToStaticMarkup(
      <Badge variant='registration'>Inscríbete</Badge>
    )
    const other = renderToStaticMarkup(
      <Badge variant='registration'>Abierto</Badge>
    )

    expect(html).toContain('>Inscríbete</span>')
    expect(other).toContain('>Abierto</span>')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-white')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex=')
  })

  test('renders an offset semantic activity-type badge with palette defaults', () => {
    const html = renderToStaticMarkup(
      <Badge variant='activity-type'>Taller</Badge>
    )

    expect(html).toContain('>Taller</span>')
    expect(html).toContain('absolute')
    expect(html).toContain('-top-2')
    expect(html).toContain('-left-2')
    expect(html).toContain('z-30')
    expect(html).toContain('bg-palette-primary/10')
    expect(html).toContain('border-palette-primary/40')
    expect(html).toContain('text-palette-foreground')
  })
})
