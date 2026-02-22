'use client'

import { useMemo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { useArtistListPaginationStore } from '../_store/artist-list-pagination-store'

export function useArtistList(): {
  paginatedIds: string[]
  totalFilteredItems: number
  countries: string[]
  cities: string[]
} {
  const filters = useArtistListFilterStore((s) => s.filters)
  const page = useArtistListPaginationStore((s) => s.page)
  const pageSize = useArtistListPaginationStore((s) => s.pageSize)

  const { allIds, byId } = useArtistsProjectionStore(
    useShallow((s) => ({ allIds: s.allIds, byId: s.byId }))
  )

  const countries = useMemo(() => {
    const countrySet = new Set<string>()
    for (const id of allIds) {
      const artist = byId[id]
      if (artist?.pais) {
        countrySet.add(artist.pais)
      }
    }
    return Array.from(countrySet).sort()
  }, [allIds, byId])

  const cities = useMemo(() => {
    const citySet = new Set<string>()
    for (const id of allIds) {
      const artist = byId[id]
      if (artist?.ciudad) {
        citySet.add(artist.ciudad)
      }
    }
    return Array.from(citySet).sort()
  }, [allIds, byId])

  const filteredIds = useMemo(() => {
    let filtered = allIds

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter((id) => {
        const artist = byId[id]
        const nombre = (artist?.nombre ?? '').toLowerCase()
        const pseudonimo = (artist?.pseudonimo ?? '').toLowerCase()
        return nombre.includes(term) || pseudonimo.includes(term)
      })
    }

    if (filters.country !== null) {
      filtered = filtered.filter((id) => byId[id]?.pais === filters.country)
    }

    if (filters.city !== null) {
      filtered = filtered.filter((id) => byId[id]?.ciudad === filters.city)
    }

    if (filters.statusId !== null) {
      filtered = filtered.filter(
        (id) => byId[id]?.estadoId === filters.statusId
      )
    }

    return filtered
  }, [allIds, byId, filters])

  useEffect(() => {
    useArtistListPaginationStore.getState().setTotalItems(filteredIds.length)
  }, [filteredIds.length])

  const paginatedIds = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredIds.slice(start, start + pageSize)
  }, [filteredIds, page, pageSize])

  return {
    paginatedIds,
    totalFilteredItems: filteredIds.length,
    countries,
    cities
  }
}
