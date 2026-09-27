import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

import { LinkCta } from './link-cta'

describe('LinkCta', () => {
  test('renders solid navigation as an accessible anchor with legible focus states', () => {
    const html = renderToStaticMarkup(
      <LinkCta href='/festival' variant='solid'>
        Entrar
      </LinkCta>
    )

    expect(html).toContain('href="/festival"')
    expect(html).toContain('>Entrar</a>')
    expect(html).not.toContain('<button')
    expect(html).toContain('bg-accent')
    expect(html).toContain('bg-linear-to-r')
    expect(html).toContain('background-size-[150%]')
    expect(html).toContain('hover:bg-right')
    expect(html).toContain('text-foreground')
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('focus-visible:ring-white')
    expect(html).toContain('focus-visible:ring-offset-primary')
    expect(html).not.toMatch(/(?:hover|focus-visible):(?:text-|bg-)(?:white|primary)/)
  })

  test('solid accent and foreground tokens meet AA without replacing the accent on hover or focus', () => {
    const palette = readFileSync(
      resolve(
        import.meta.dir,
        '../../../../packages/tailwind-config/palettes/base.css'
      ),
      'utf8'
    )
    const color = (name: string) => {
      const value = palette.match(
        new RegExp(`--color-${name}: (#\\w{6});`)
      )?.[1]
      if (!value) throw new Error(`Missing palette color: ${name}`)
      return value
    }
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map((index) => {
        const value = parseInt(hex.slice(index, index + 2), 16) / 255
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4
      })
      return (
        channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
      )
    }
    const contrast = (foreground: string, background: string) => {
      const light = Math.max(luminance(foreground), luminance(background))
      const dark = Math.min(luminance(foreground), luminance(background))
      return (light + 0.05) / (dark + 0.05)
    }
    const foregroundLightness = Number(
      palette.match(/--color-foreground: oklch\(([\d.]+) 0 0\)/)?.[1]
    )
    expect(Number.isFinite(foregroundLightness)).toBe(true)
    // Neutral OKLCH has linear sRGB luminance L³; no invented hover palette.
    const foregroundLuminance = foregroundLightness ** 3
    const accentLuminance = luminance(color('accent'))
    const accentContrast =
      (accentLuminance + 0.05) / (foregroundLuminance + 0.05)
    expect(accentContrast).toBeGreaterThanOrEqual(4.5)
    expect(accentContrast).toBeGreaterThan(5.9)
    expect(contrast('#ffffff', color('accent'))).toBeLessThan(4.5)
  })

  test('renders offset navigation with foreground/background inversion and safe external attributes', () => {
    const html = renderToStaticMarkup(
      <LinkCta
        href='https://example.org'
        target='_blank'
        rel='noopener noreferrer'
        variant='offset'
      >
        Ver más
      </LinkCta>
    )

    expect(html).toContain('href="https://example.org"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('>Ver más</span>')
    expect(html).not.toContain('<button')
    expect(html).toContain('bg-background text-primary')
    expect(html).toContain(
      'group-hover/btn:bg-primary group-hover/btn:text-background'
    )
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain(
      'group-focus-visible/btn:bg-primary group-focus-visible/btn:text-background'
    )
  })
})
