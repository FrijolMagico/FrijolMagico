import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const catalogActionsDirectory = join(import.meta.dir, '../../app/(core)/artistas/catalogo/_actions')
const artistActionsDirectory = join(import.meta.dir, '../../app/(core)/artistas/_actions')

const catalogActions = [
  'create-catalog.action.ts',
  'update-catalog-field.action.ts',
  'update-catalog.action.ts',
  'delete-catalog.action.ts'
].map((file) => join(catalogActionsDirectory, file))

const artistActions = [
  'update-artista.action.ts',
  'artist-pseudonym-mutations.action.ts',
  'delete-artista.action.ts'
].map((file) => join(artistActionsDirectory, file))

const sources = [...catalogActions, ...artistActions].map((path) => readFileSync(path, 'utf8'))

function readSource(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('catalog SWR invalidation', () => {
  test('catalog and artist mutations invalidate by tag without forcing the listing path', () => {
    for (const source of sources) {
      expect(source).not.toContain("path: '/catalogo'")
      expect(source).toContain('CATALOG_BASE_CACHE_TAG')
      expect(source).toMatch(/revalidateWebCache(?:BestEffort)?\(/)
    }
  })

  test('deleting an artist invalidates participation rows as well as base catalog rows', () => {
    const deleteArtistSource = readSource(join(artistActionsDirectory, 'delete-artista.action.ts'))

    expect(deleteArtistSource).toContain('CATALOG_PARTICIPATION_CACHE_TAG')
    expect(deleteArtistSource).toMatch(/revalidateWebCache\(\{\s*tag: CATALOG_PARTICIPATION_CACHE_TAG\s*\}\)/)
  })
})
