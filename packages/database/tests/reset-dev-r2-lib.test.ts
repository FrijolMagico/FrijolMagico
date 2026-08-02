import { describe, expect, test } from 'bun:test'

import { devR2Config } from '../scripts/clean-devr2/config'
import {
  buildCleanupPlan,
  collectProtectedFolderPrefixes,
  isDevEnvironment,
  isFolderPlaceholder,
  isKeyExcluded,
  normalizeAssetKey,
  normalizeExcludedFolder,
  parseSeedAssetKeys,
} from '../scripts/clean-devr2/reset-dev-r2-lib'

const assetColumns = devR2Config.assetColumns

describe('isDevEnvironment', () => {
  test('accepts exactly NODE_ENV=development without VERCEL_ENV', () => {
    expect(isDevEnvironment({ NODE_ENV: 'development' })).toBeTrue()
  })

  test('rejects production', () => {
    expect(isDevEnvironment({ NODE_ENV: 'production' })).toBeFalse()
  })

  test('rejects preview and any other arbitrary value', () => {
    expect(isDevEnvironment({ NODE_ENV: 'preview' })).toBeFalse()
    expect(isDevEnvironment({ NODE_ENV: 'staging' })).toBeFalse()
    expect(isDevEnvironment({ NODE_ENV: 'test' })).toBeFalse()
  })

  test('rejects a missing NODE_ENV (fail-closed)', () => {
    expect(isDevEnvironment({})).toBeFalse()
  })

  test('rejects any VERCEL_ENV, even the Vercel development value', () => {
    expect(
      isDevEnvironment({ NODE_ENV: 'development', VERCEL_ENV: 'production' }),
    ).toBeFalse()
    expect(
      isDevEnvironment({ NODE_ENV: 'development', VERCEL_ENV: 'preview' }),
    ).toBeFalse()
    expect(
      isDevEnvironment({ NODE_ENV: 'development', VERCEL_ENV: 'development' }),
    ).toBeFalse()
  })
})

describe('normalizeAssetKey', () => {
  test('keeps relative keys as-is', () => {
    expect(normalizeAssetKey('artistas/anima-red/avatar-123.webp')).toBe(
      'artistas/anima-red/avatar-123.webp',
    )
  })

  test('strips leading slashes', () => {
    expect(normalizeAssetKey('/artistas/anima-red/avatar-123.webp')).toBe(
      'artistas/anima-red/avatar-123.webp',
    )
  })

  test('strips query strings (version is not part of the key)', () => {
    expect(
      normalizeAssetKey('artistas/anima-red/avatar-123.webp?v=456'),
    ).toBe('artistas/anima-red/avatar-123.webp')
  })

  test('drops absolute HTTP(S) URLs', () => {
    expect(
      normalizeAssetKey('https://cdn-dev.frijolmagico.cl/artistas/anima-red/avatar-123.webp'),
    ).toBeNull()
    expect(normalizeAssetKey('http://example.com/image.webp')).toBeNull()
  })

  test('rejects null, empty and whitespace-only values', () => {
    expect(normalizeAssetKey(null)).toBeNull()
    expect(normalizeAssetKey(undefined)).toBeNull()
    expect(normalizeAssetKey('')).toBeNull()
    expect(normalizeAssetKey('   ')).toBeNull()
  })
})

describe('normalizeExcludedFolder', () => {
  test('normalizes all accepted forms to a trailing-slash prefix', () => {
    expect(normalizeExcludedFolder('artistas/*')).toBe('artistas/')
    expect(normalizeExcludedFolder('artistas/')).toBe('artistas/')
    expect(normalizeExcludedFolder('artistas')).toBe('artistas/')
    expect(normalizeExcludedFolder(' festivales/ ')).toBe('festivales/')
    expect(normalizeExcludedFolder('*')).toBe('/')
  })

  test('rejects blank entries', () => {
    expect(normalizeExcludedFolder('')).toBeNull()
    expect(normalizeExcludedFolder('   ')).toBeNull()
  })
})

describe('isKeyExcluded', () => {
  test('excludes recursively with the wildcard form', () => {
    const folders = ['artistas/*']
    expect(isKeyExcluded('artistas/1/avatar-x.webp', folders)).toBeTrue()
    expect(isKeyExcluded('artistas/acekuros/', folders)).toBeTrue()
    expect(isKeyExcluded('artistas/acekuros/avatar-x.webp', folders)).toBeTrue()
  })

  test('excludes recursively with the trailing-slash and bare forms', () => {
    expect(isKeyExcluded('artistas/1/avatar-x.webp', ['artistas/'])).toBeTrue()
    expect(isKeyExcluded('artistas/1/avatar-x.webp', ['artistas'])).toBeTrue()
  })

  test('excludes subfolder prefixes', () => {
    expect(isKeyExcluded('artistas/19/avatar-x.webp', ['artistas/19/*'])).toBeTrue()
    expect(isKeyExcluded('artistas/1/avatar-x.webp', ['artistas/19/*'])).toBeFalse()
  })

  test('does not exclude outside the folder', () => {
    const folders = ['artistas/']
    expect(isKeyExcluded('festivales/frijol-magico/afiche.webp', folders)).toBeFalse()
    expect(isKeyExcluded('artistas-extra/x.webp', folders)).toBeFalse()
  })

  test('empty or blank config excludes nothing', () => {
    expect(isKeyExcluded('artistas/1/avatar-x.webp', [])).toBeFalse()
    expect(isKeyExcluded('artistas/1/avatar-x.webp', ['  '])).toBeFalse()
  })
})

describe('isFolderPlaceholder', () => {
  test('detects keys ending with slash', () => {
    expect(isFolderPlaceholder('artistas/')).toBeTrue()
    expect(isFolderPlaceholder('artistas/anima-red/avatar.webp')).toBeFalse()
  })
})

describe('collectProtectedFolderPrefixes', () => {
  test('collects every folder prefix leading to a protected key', () => {
    const keys = ['a/b/c.webp', 'x/y.webp', 'z.webp']
    const prefixes = collectProtectedFolderPrefixes(
      keys,
      (key) => key === 'a/b/c.webp',
    )
    expect(prefixes.has('a/')).toBeTrue()
    expect(prefixes.has('a/b/')).toBeTrue()
    expect(prefixes.has('x/')).toBeFalse()
    expect(prefixes.has('z/')).toBeFalse()
  })

  test('protects folder placeholders of protected paths', () => {
    const keys = [
      'artistas/anima-red/',
      'artistas/anima-red/avatar-1.webp',
    ]
    const prefixes = collectProtectedFolderPrefixes(
      keys,
      (key) => key === 'artistas/anima-red/avatar-1.webp',
    )
    expect(prefixes.has('artistas/')).toBeTrue()
    expect(prefixes.has('artistas/anima-red/')).toBeTrue()
  })
})

describe('buildCleanupPlan', () => {
  test('keeps preserved seed assets and their folder placeholders', () => {
    const keys = [
      'a/',
      'a/b/',
      'a/b/c.webp',
      'a/b/x.webp',
      'z.webp',
    ]
    const plan = buildCleanupPlan(keys, ['a/b/c.webp'], [])
    expect(plan.excludedKeys).toEqual([])
    expect(plan.assetsToDelete).toEqual(['a/b/x.webp', 'z.webp'])
    expect(plan.folderPlaceholdersToDelete).toEqual([])
  })

  test('deletes unprotectected folders completely (assets + placeholders)', () => {
    const keys = ['tmp/', 'tmp/t.webp', 'keep.webp']
    const plan = buildCleanupPlan(keys, ['keep.webp'], [])
    expect(plan.assetsToDelete).toEqual(['tmp/t.webp'])
    expect(plan.folderPlaceholdersToDelete).toEqual(['tmp/'])
    // Bucket order preserved: placeholder and asset, nothing shrunk.
    expect(plan.toDelete).toEqual(['tmp/', 'tmp/t.webp'])
  })

  test('keeps everything under excluded folders, recursively', () => {
    const keys = ['asoc/', 'asoc/logo.png', 'asoc/inner/x.webp', 'asoc-inner/y.webp']
    const plan = buildCleanupPlan(keys, [], ['asoc/'])
    expect(plan.excludedKeys).toEqual([
      'asoc/',
      'asoc/logo.png',
      'asoc/inner/x.webp',
    ])
    expect(plan.assetsToDelete).toEqual(['asoc-inner/y.webp'])
    expect(plan.folderPlaceholdersToDelete).toEqual([])
  })

  test('seed protection wins over folder deletion', () => {
    const keys = ['a/b/c.webp', 'a/b/x.webp', 'a/']
    const plan = buildCleanupPlan(keys, ['a/b/c.webp'], [])
    expect(plan.assetsToDelete).toEqual(['a/b/x.webp'])
    expect(plan.folderPlaceholdersToDelete).toEqual([])
    // 'a/' is kept: prefix of the protected path a/b/c.webp
    expect(plan.assetsToDelete).not.toContain('a/')
  })
})

describe('parseSeedAssetKeys', () => {
  test('extracts artista_imagen imagen_url values', () => {
    const sql = `
      INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
      VALUES (1, 1, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'artistas/anima-red/avatar-123456789.webp',
    ])
  })

  test('extracts evento_edicion poster_url and poster_path', () => {
    const sql = `
      INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
      VALUES (1, 1, NULL, 'I', 'frijol-magico-i', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'festivales/frijol-magico/i/afiche-123456789.webp',
    ])
  })

  test('survives column reordering', () => {
    const sql = `
      INSERT INTO artista_imagen (imagen_url, id, tipo)
      VALUES ('artistas/shobian/avatar-123.webp', 2, 'avatar');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'artistas/shobian/avatar-123.webp',
    ])
  })

  test('handles multi-tuple INSERT statements', () => {
    const sql = `
      INSERT INTO artista_imagen (id, imagen_url, tipo)
      VALUES (1, 'artistas/a/avatar-1.webp', 'avatar'),
             (2, 'artistas/b/avatar-2.webp', 'avatar');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'artistas/a/avatar-1.webp',
      'artistas/b/avatar-2.webp',
    ])
  })

  test('ignores NULL values and non-asset tables', () => {
    const sql = `
      INSERT INTO artista (id, nombre)
      VALUES (1, 'Ánima Rojas');
      INSERT INTO artista_imagen (id, artista_id, imagen_url, deleted_at)
      VALUES (1, 1, NULL, NULL);
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([])
  })

  test('drops absolute URLs inside asset columns', () => {
    const sql = `
      INSERT INTO evento_edicion (id, poster_url, poster_path)
      VALUES (1, 'https://cdn-dev.frijolmagico.cl/afiche.webp', 'festivales/frijol-magico/afiche.webp');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'festivales/frijol-magico/afiche.webp',
    ])
  })

  test('deduplicates repeated keys', () => {
    const sql = `
      INSERT INTO evento_edicion (id, poster_url, poster_path)
      VALUES (1, 'festivales/frijol-magico/afiche.webp', 'festivales/frijol-magico/afiche.webp');
    `
    expect(parseSeedAssetKeys(sql, assetColumns)).toEqual([
      'festivales/frijol-magico/afiche.webp',
    ])
  })

  test('parses the real seed.sql asset set', async () => {
    const seedSql = await Bun.file(
      new URL('../seed/seed.sql', import.meta.url),
    ).text()
    const keys = parseSeedAssetKeys(seedSql, assetColumns)

    expect(keys).toContain('artistas/anima-red/avatar-123456789.webp')
    expect(keys).toContain('artistas/cat-linaa-art/avatar-123456789.webp')
    expect(keys).toContain(
      'festivales/frijol-magico/i/afiche-123456789.webp',
    )
    expect(keys).toContain(
      'festivales/frijol-magico/ii/afiche-123456789.webp',
    )
    // 15 seed avatars + 2 seed posters, deduplicated.
    expect(keys).toHaveLength(17)
  })
})
