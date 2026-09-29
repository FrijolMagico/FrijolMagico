import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'bun:test'

const paletteCss = readFileSync(
  new URL('../../../../packages/tailwind-config/palettes/base.css', import.meta.url),
  'utf8'
)

function declarationsFor(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = paletteCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`))?.[1]

  if (!block) {
    throw new Error(`Missing CSS rule for ${selector}`)
  }

  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, property, value]) => [
      property,
      value.replace(/\s+/g, ' ').trim()
    ])
  )
}

describe('palette CSS fallbacks', () => {
  test('falls back to each matching base role and preserves explicit palette values', () => {
    const fallbacks = declarationsFor('@theme inline')
    const expectedFallbacks = {
      '--color-palette-foreground': 'var(--theme-palette-foreground, var(--color-foreground))',
      '--color-palette-background': 'var(--theme-palette-background, var(--color-background))',
      '--color-palette-primary': 'var(--theme-palette-primary, var(--color-primary))',
      '--color-palette-secondary': 'var(--theme-palette-secondary, var(--color-secondary))',
      '--color-palette-accent': 'var(--theme-palette-accent, var(--color-accent))',
      '--color-palette-outline': 'var(--theme-palette-outline, var(--color-border))',
      '--color-palette-link': 'var(--theme-palette-link, var(--color-link))',
      '--color-palette-shadow': 'var(--theme-palette-shadow, var(--color-shadow))'
    }

    expect(
      Object.fromEntries(
        Object.keys(expectedFallbacks).map((property) => [property, fallbacks[property]])
      )
    ).toEqual(expectedFallbacks)

    expect(declarationsFor("[data-palette='base']")).toEqual({
      '--theme-palette-background': 'var(--color-background)',
      '--theme-palette-foreground': 'var(--color-foreground)',
      '--theme-palette-primary': 'var(--color-primary)',
      '--theme-palette-secondary': 'var(--color-secondary)',
      '--theme-palette-outline': 'var(--color-border)',
      '--theme-palette-accent': 'var(--color-accent)',
      '--theme-palette-link': 'var(--color-link)',
      '--theme-palette-shadow': 'var(--color-shadow)'
    })

    expect(declarationsFor("[data-palette='ffm-xv']")).toEqual({
      '--theme-palette-foreground': 'oklch(97.024% 0.01501 37.542)',
      '--theme-palette-accent': 'oklch(0.4866 0.1317 149.67)',
      '--theme-palette-secondary': '#fe9a00',
      '--theme-palette-background': 'oklch(80.637% 0.11154 33.77)',
      '--theme-palette-primary': '#b80063',
      '--theme-palette-outline': 'oklch(59.331% 0.10329 14.304)'
    })

    expect(declarationsFor("[data-palette='ffm-xvi']")).toEqual({
      '--theme-palette-background': '#ffffff',
      '--theme-palette-foreground': '#003c91',
      '--theme-palette-primary': '#e664cd',
      '--theme-palette-secondary': '#0073b8',
      '--theme-palette-accent': '#a0c85a',
      '--theme-palette-outline': '#003c91',
      '--theme-palette-link': '#e664cd',
      '--theme-palette-shadow': '#003c91'
    })
  })
})
