import { describe, test, expect } from 'bun:test'
import type { CatalogArtist } from '../../types/catalog'
import { getRelatedArtists } from '../lib/getRelatedArtists'

const mockCatalogData: CatalogArtist[] = [
  {
    id: '1',
    name: 'A',
    city: 'La Serena',
    category: 'Ilustracion'
  } as CatalogArtist,
  {
    id: '2',
    name: 'B',
    city: 'Santiago',
    category: 'Ilustracion'
  } as CatalogArtist,
  {
    id: '3',
    name: 'C',
    city: 'La Serena',
    category: 'Manualidades'
  } as CatalogArtist,
  {
    id: '4',
    name: 'D',
    city: 'Coquimbo',
    category: 'Narrativa Grafica'
  } as CatalogArtist,
  {
    id: '5',
    name: 'E',
    city: 'Valparaiso',
    category: 'Ilustracion'
  } as CatalogArtist,
  {
    id: '6',
    name: 'F',
    city: 'La Serena',
    category: 'Diseño'
  } as CatalogArtist,
  { id: '7', name: 'G', city: 'Arica', category: 'Fotografia' } as CatalogArtist
]

describe('RelatedArtists Algorithm', () => {
  test('prioritizes artists from the same category, then same city, then others', () => {
    const artistToMatch = mockCatalogData[0] // id: 1, city: La Serena, category: Ilustracion

    // limit 10 to see the exact order of all related
    const related = getRelatedArtists(artistToMatch, mockCatalogData, 10)
    const relatedIds = related.map((a) => a.id)

    // Expected order of groups:
    // 1. Same category (excluding self): id 2, id 5
    // 2. Same city (excluding already in category): id 3, id 6
    // 3. Others: id 4, id 7

    expect(relatedIds).not.toContain('1') // Never includes itself
    expect(related.length).toBe(6)

    // First two MUST be from the same category
    expect(['2', '5']).toContain(relatedIds[0])
    expect(['2', '5']).toContain(relatedIds[1])

    // Next two MUST be from the same city
    expect(['3', '6']).toContain(relatedIds[2])
    expect(['3', '6']).toContain(relatedIds[3])

    // Last two MUST be others
    expect(['4', '7']).toContain(relatedIds[4])
    expect(['4', '7']).toContain(relatedIds[5])
  })

  test('fills with others if not enough same category or same city', () => {
    const artistToMatch = mockCatalogData[3] // id: 4, city: Coquimbo, category: Narrativa Grafica

    // Solo id 4 es de Coquimbo y Narrativa Gráfica. No hay más en mock.
    // Debería llenar con otros artistas de distintas ciudades/categorías.
    const related = getRelatedArtists(artistToMatch, mockCatalogData, 4)

    expect(related.length).toBe(4)
    expect(related.map((a) => a.id)).not.toContain('4')
  })

  test('is deterministic (seeded shuffle returns same order for same artist ID)', () => {
    const artistToMatch = mockCatalogData[0]

    const related1 = getRelatedArtists(artistToMatch, mockCatalogData, 4)
    const related2 = getRelatedArtists(artistToMatch, mockCatalogData, 4)

    expect(related1.map((a) => a.id)).toEqual(related2.map((a) => a.id))
  })

  test('limits the results correctly to 4 by default', () => {
    const artistToMatch = mockCatalogData[0]
    // Se usa el default parameter limit = 4
    const related = getRelatedArtists(artistToMatch, mockCatalogData)

    expect(related.length).toBe(4)
  })
})
