import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import type { FC, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'

// ── Mock deep dependencies ──

mock.module('next/image', () => ({
  default: ({ alt }: { alt: string }) => createElement('img', { alt })
}))

mock.module('@/config/paths', () => ({
  paths: {
    home: {
      path: '/',
      sub: {
        festival: { path: '/festivales' },
        catalog: { path: '/catalogo' },
        about: { path: '/nosotros' }
      }
    }
  }
}))

mock.module('@/data/site.json', () => ({
  social_media: {
    ig: 'https://instagram.com',
    fb: 'https://facebook.com',
    yt: 'https://youtube.com'
  },
  podcast: 'https://spotify.com'
}))

mock.module('@/components/fissure/FissureEdgeDecoration', () => ({
  FissureEdgeDecoration: () => createElement('div', { 'data-testid': 'fissure-decoration' })
}))

mock.module('@/components/fissure/mask', () => ({
  createFissureMaskStyle: () => ({})
}))

mock.module('./BackToTop', () => ({
  BackToTop: () => createElement('div', { 'data-testid': 'back-to-top' })
}))

mock.module('./LinkBtn', () => ({
  LinkBtn: ({ href, children }: { href: string; children: ReactNode }) =>
    createElement('a', { href, 'data-testid': 'link-btn' }, children)
}))

import { Footer } from './Footer'

describe('Footer', () => {
  test('renders dynamic version from APP_VERSION, not hardcoded v4.0.0', () => {
    render(<Footer />)

    // Version text should match the dynamic pattern vX.Y.Z
    const versionText = screen.getByText(/v\d+\.\d+\.\d+/)
    expect(versionText).toBeDefined()
    expect(versionText.textContent).not.toBe('v4.0.0')
  })
})
