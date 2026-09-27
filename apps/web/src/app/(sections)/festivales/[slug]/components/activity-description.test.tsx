import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { ActivityDescription } from './activity-description'

const renderDescription = (description: string | null) =>
  renderToStaticMarkup(<ActivityDescription description={description} />)

describe('ActivityDescription', () => {
  test('renders editor formatting, lists, and safe links without nested paragraphs', () => {
    const html = renderDescription(
      '<p>Un <strong>gran</strong> <em>taller</em> <a href="https://example.org/info" target="evil" onclick="alert(1)">Detalles</a></p><ul><li>Uno</li></ul><ol><li>Dos</li></ol><p><s>Antes</s> <code>ahora</code></p>'
    )

    expect(html).toContain('<p>Un <strong>gran</strong> <em>taller</em>')
    expect(html).toContain('<ul><li>Uno</li></ul><ol><li>Dos</li></ol>')
    expect(html).toContain('<s>Antes</s> <code>ahora</code>')
    expect(html).toContain(
      'href="https://example.org/info" target="_blank" rel="noopener noreferrer"'
    )
    expect(html).not.toContain('onclick')
    expect(html).not.toMatch(/<p[^>]*>\s*<p/)
    expect(html).toContain('[&amp;_ul]:list-disc')
    expect(html).toContain('[&amp;_ol]:list-decimal')
    expect(html).toContain('[&amp;_a]:underline')
  })

  test('strips scripts, event handlers, styles and unsupported elements', () => {
    const html = renderDescription(
      '<script>alert(1)</script><p class="evil" style="background:url(https://evil.test)" onmouseover="alert(2)">Hola<img src="https://evil.test/track" onerror="alert(3)"><strong id="x">bien</strong></p><iframe src="https://evil.test"></iframe>'
    )

    expect(html).toContain('<p>Hola<strong>bien</strong></p>')
    expect(html).not.toContain('alert(')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('style=')
    expect(html).not.toContain('onmouseover')
  })

  test('rejects javascript, data and protocol-relative links including encoded protocols', () => {
    const html = renderDescription(
      '<p><a href="javascript:alert(1)">A</a> <a href="data:text/html,evil">B</a> <a href="&#x6a;avascript:alert(1)">C</a> <a href="//evil.test">D</a> <a href="mailto:hello@example.org">Email</a></p>'
    )

    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('data:')
    expect(html).not.toContain('//evil.test')
    expect(html).toContain('href="mailto:hello@example.org"')
    expect(html).not.toContain('alert(')
  })

  test('preserves legacy literal tag-looking text and angle brackets', () => {
    const html = renderDescription('Visita <festival> y usa 2 < 3 & sigue')
    expect(html).toContain('Visita &lt;festival&gt; y usa 2 &lt; 3 &amp; sigue')
    expect(html).not.toContain('<p>')
  })

  test('keeps ambiguous inline-only markup as escaped legacy text', () => {
    const html = renderDescription('Escribe <b>hola</b> y <script>alert(1)</script>')
    expect(html).toContain('&lt;b&gt;hola&lt;/b&gt;')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>')
  })

  test('sanitizes hostile markup around an editor block', () => {
    const html = renderDescription(
      '<script>alert(1)</script><p>Seguro <a href="javascript:alert(2)" onclick="alert(3)">aquí</a></p>'
    )
    expect(html).toContain('<p>Seguro <a target="_blank" rel="noopener noreferrer">aquí</a></p>')
    expect(html).not.toContain('alert(')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('javascript:')
  })

  test('omits null and empty descriptions', () => {
    expect(renderDescription(null)).toBe('')
    expect(renderDescription('')).toBe('')
  })
})
