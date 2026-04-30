import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// ---------------------------------------------------------------------------
// Source paths for catalog server actions
// ---------------------------------------------------------------------------

const ACTIONS_DIR = join(
  import.meta.dir,
  '../../../../../../..',
  'src/app/(core)/artistas/catalogo/_actions'
)

const UPDATE_FIELD_PATH = join(ACTIONS_DIR, 'update-catalog-field.action.ts')
const UPDATE_CATALOG_PATH = join(ACTIONS_DIR, 'update-catalog.action.ts')
const DELETE_CATALOG_PATH = join(ACTIONS_DIR, 'delete-catalog.action.ts')

// ---------------------------------------------------------------------------
// Contract tests: verify web invalidation is wired in catalog actions
// ---------------------------------------------------------------------------

describe('catalog server actions — web invalidation contracts', () => {
  test('update-catalog-field.action imports invalidateWebFeaturedArtists', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    expect(source).toContain('invalidateWebFeaturedArtists')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('update-catalog-field.action calls void invalidateWebFeaturedArtists()', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    // Must use fire-and-forget pattern
    expect(source).toContain('void invalidateWebFeaturedArtists()')
  })

  test('update-catalog.action imports invalidateWebFeaturedArtists', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('invalidateWebFeaturedArtists')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('update-catalog.action calls void invalidateWebFeaturedArtists()', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('void invalidateWebFeaturedArtists()')
  })

  test('delete-catalog.action imports invalidateWebFeaturedArtists', () => {
    const source = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(source).toContain('invalidateWebFeaturedArtists')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('delete-catalog.action calls void invalidateWebFeaturedArtists()', () => {
    const source = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(source).toContain('void invalidateWebFeaturedArtists()')
  })

  test('all three actions preserve existing updateTag() call', () => {
    const updateFieldSource = readFileSync(UPDATE_FIELD_PATH, 'utf8')
    const updateCatalogSource = readFileSync(UPDATE_CATALOG_PATH, 'utf8')
    const deleteCatalogSource = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(updateFieldSource).toContain('updateTag(CATALOG_CACHE_TAG)')
    expect(updateCatalogSource).toContain('updateTag(CATALOG_CACHE_TAG)')
    expect(deleteCatalogSource).toContain('updateTag(CATALOG_CACHE_TAG)')
  })
})
