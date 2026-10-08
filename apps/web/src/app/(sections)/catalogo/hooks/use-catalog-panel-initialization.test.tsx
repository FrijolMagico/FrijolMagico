import '../../../../../test-setup'

import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import { useCatalogPanelInitialization } from './use-catalog-panel-initialization'
import { useCatalogPanelStore } from '../store/useCatalogPanelStore'

function Probe() {
  useCatalogPanelInitialization()
  return null
}

const setCatalogURL = (search: string) => {
  window.history.replaceState(null, '', `/catalogo${search}`)
}

afterEach(() => {
  cleanup()
  useCatalogPanelStore.getState().setArtistPanelOpen(false)
  useCatalogPanelStore.getState().setArtistSlug(null)
  setCatalogURL('')
})

describe('catalog panel delayed initialization', () => {
  test('opens the artist from a direct bookmark URL', () => {
    setCatalogURL('?artista=canela')

    render(<Probe />)

    expect(useCatalogPanelStore.getState().artistSlug).toBe('canela')
    expect(useCatalogPanelStore.getState().isArtistPanelOpen).toBe(true)
  })

  test('preserves the latest card selection when the panel mounts after a click', () => {
    setCatalogURL('?artista=bookmark')
    useCatalogPanelStore.getState().setArtistSlug('latest-click')
    useCatalogPanelStore.getState().setArtistPanelOpen(true)

    render(<Probe />)

    expect(useCatalogPanelStore.getState().artistSlug).toBe('latest-click')
    expect(useCatalogPanelStore.getState().isArtistPanelOpen).toBe(true)
  })
})
