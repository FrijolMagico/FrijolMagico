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
const ARTIST_ACTIONS_DIR = join(
  import.meta.dir,
  '../../../../../../..',
  'src/app/(core)/artistas/_actions'
)
const UPDATE_ARTISTA_PATH = join(ARTIST_ACTIONS_DIR, 'update-artista.action.ts')
const DELETE_ARTISTA_PATH = join(ARTIST_ACTIONS_DIR, 'delete-artista.action.ts')
const CANONICAL_SLUG_ROUTE_PATH = join(
  import.meta.dir,
  '..', '..', '..', '..', '..', '..', '..', '..', '..',
  'apps/web/src/app/api/catalog/canonical-slugs/route.ts'
)

// ---------------------------------------------------------------------------
// Contract tests: verify web invalidation is wired in catalog actions
// ---------------------------------------------------------------------------

describe('catalog server actions — web invalidation contracts', () => {
  test('update-catalog-field.action imports revalidateWebCache', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    expect(source).toContain('revalidateWebCache')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('update-catalog-field.action imports CATALOG_CACHE_TAG from shared package', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    expect(source).toContain('CATALOG_CACHE_TAG')
    expect(source).toContain("from '@frijolmagico/cache-tags'")
  })

  test('update-catalog-field.action uses tag-only catalog invalidation', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    expect(source).toContain('void revalidateWebCache({ tag })')
    expect(source).toContain('CATALOG_BASE_CACHE_TAG')
    expect(source).not.toContain("path: '/catalogo'")
  })

  test('update-catalog.action imports revalidateWebCache', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('revalidateWebCache')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('update-catalog.action imports CATALOG_CACHE_TAG from shared package', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('CATALOG_CACHE_TAG')
    expect(source).toContain("from '@frijolmagico/cache-tags'")
  })

  test('update-catalog.action uses tag-only catalog invalidation', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('void revalidateWebCache({ tag })')
    expect(source).toContain('CATALOG_BASE_CACHE_TAG')
    expect(source).not.toContain("path: '/catalogo'")
  })

  test('delete-catalog.action imports revalidateWebCache', () => {
    const source = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(source).toContain('revalidateWebCache')
    expect(source).toContain('@/shared/lib/web-invalidation')
  })

  test('delete-catalog.action imports CATALOG_CACHE_TAG from shared package', () => {
    const source = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(source).toContain('CATALOG_CACHE_TAG')
    expect(source).toContain("from '@frijolmagico/cache-tags'")
  })

  test('delete-catalog.action uses tag-only catalog invalidation', () => {
    const source = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    expect(source).toContain('void revalidateWebCache({ tag })')
    expect(source).toContain('CATALOG_BASE_CACHE_TAG')
    expect(source).not.toContain("path: '/catalogo'")
  })

  test('all three actions preserve legacy catalog invalidation', () => {
    const updateFieldSource = readFileSync(UPDATE_FIELD_PATH, 'utf8')
    const updateCatalogSource = readFileSync(UPDATE_CATALOG_PATH, 'utf8')
    const deleteCatalogSource = readFileSync(DELETE_CATALOG_PATH, 'utf8')

    for (const source of [updateFieldSource, updateCatalogSource, deleteCatalogSource]) {
      expect(source).toContain('CATALOG_CACHE_TAG')
      expect(source).toContain('updateTag(tag)')
    }
  })

  test('update-catalog.action uses one transaction for catalog and historical avatar activation', () => {
    const source = readFileSync(UPDATE_CATALOG_PATH, 'utf8')

    expect(source).toContain('db.transaction')
    expect(source).toContain('AVATAR_CONFLICT')
    expect(source).toContain('intent === AVATAR_INTENT.HISTORICAL')
  })

  test('update-catalog-field invalidates canonical slugs when activo is supplied', () => {
    const source = readFileSync(UPDATE_FIELD_PATH, 'utf8')

    expect(source).toMatch(/if \('activo' in parsed\.data\)[\s\S]*?CANONICAL_CATALOG_SLUGS_CACHE_TAG/)
    expect(source).toMatch(/tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,\s*mode: 'immediate'/)
  })

  test('delete-artista invalidates canonical slugs after deleting its catalog entries', () => {
    const source = readFileSync(DELETE_ARTISTA_PATH, 'utf8')

    expect(source).toContain('deleteCatalogEntry')
    expect(source).toMatch(/CANONICAL_CATALOG_SLUGS_CACHE_TAG,\s*mode: 'immediate'/)
  })

  test('canonical slug API selects only active, non-deleted catalog artist slugs', () => {
    const source = readFileSync(CANONICAL_SLUG_ROUTE_PATH, 'utf8')
    const query = source.match(/export const CANONICAL_CATALOG_SLUGS_QUERY = `([\s\S]*?)`/)?.[1]

    expect(query?.replace(/\s+/g, ' ').trim()).toBe(
      'SELECT a.slug FROM catalogo_artista ca JOIN artista a ON ca.artista_id = a.id WHERE ca.activo = 1 AND ca.deleted_at IS NULL AND a.slug IS NOT NULL'
    )
  })
})
