import { useEffect } from 'react'
import { useCatalogPanelStore } from '../store/useCatalogPanelStore'

export const getArtistSlugFromURL = () => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('artista')
}

export function useCatalogPanelInitialization() {
  useEffect(() => {
    const state = useCatalogPanelStore.getState()
    if (state.artistSlug || state.isArtistPanelOpen) return

    const urlSlug = getArtistSlugFromURL()
    if (urlSlug) {
      state.setArtistSlug(urlSlug)
      state.setArtistPanelOpen(true)
    }
  }, [])
}
