'use client'

import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { useArtistListPaginationStore } from '../_store/artist-list-pagination-store'
import type { DomainArtist } from '../_types/artist'

export function useArtistList(artists: DomainArtist[]): {
  paginatedArtists: DomainArtist[]
  totalFilteredItems: number
  countries: string[]
  cities: string[]
} {
  const filters = useArtistListFilterStore((s) => s.filters)
  const page = useArtistListPaginationStore((s) => s.page)
  const pageSize = useArtistListPaginationStore((s) => s.pageSize)

  const countries = Array.from(
    new Set(artists.map((a) => a.pais).filter(Boolean))
  ).sort() as string[]

  const cities = Array.from(
    new Set(artists.map((a) => a.ciudad).filter(Boolean))
  ).sort() as string[]

  let filteredArtists = artists

  if (filters.search) {
    const term = filters.search.toLowerCase()
    filteredArtists = filteredArtists.filter((a) => {
      const nombre = (a.nombre ?? '').toLowerCase()
      const pseudonimo = (a.pseudonimo ?? '').toLowerCase()
      return nombre.includes(term) || pseudonimo.includes(term)
    })
  }

  if (filters.country !== null) {
    filteredArtists = filteredArtists.filter((a) => a.pais === filters.country)
  }

  if (filters.city !== null) {
    filteredArtists = filteredArtists.filter((a) => a.ciudad === filters.city)
  }

  if (filters.statusId !== null) {
    filteredArtists = filteredArtists.filter(
      (a) => a.estadoId === filters.statusId
    )
  }

  const start = (page - 1) * pageSize
  const paginatedArtists = filteredArtists.slice(start, start + pageSize)

  return {
    paginatedArtists,
    totalFilteredItems: filteredArtists.length,
    countries,
    cities
  }
}
