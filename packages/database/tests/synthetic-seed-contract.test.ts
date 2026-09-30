import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const migrationsFolder = join(import.meta.dir, '../migrations')
const seedPath = join(import.meta.dir, '../seed/seed.sql')
const directories: string[] = []

async function freshSeededDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'synthetic-seed-contract-'))
  directories.push(directory)
  const client = createClient({ url: `file:${join(directory, 'test.db')}` })
  await client.execute('PRAGMA foreign_keys = ON')
  await migrate(drizzle(client), { migrationsFolder })

  const statements = readFileSync(seedPath, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  expect(statements.length).toBeGreaterThan(5)
  await client.execute('PRAGMA foreign_keys = OFF')
  for (const [index, statement] of statements.entries()) {
    try {
      await client.execute(statement)
    } catch (error) {
      throw new Error(
        `Complete seed failed at statement ${index + 1}/${statements.length}`,
        { cause: error }
      )
    }
  }
  await client.execute('PRAGMA foreign_keys = ON')

  return client
}

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('synthetic festival seed contract', () => {
  test('published temp edition has a broad participant mix across multiple dates', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT edition.id AS edition_id,
        COUNT(DISTINCT participation.id) AS participation_count,
        COUNT(DISTINCT participation.artista_id) AS artist_count,
        COUNT(DISTINCT participation.agrupacion_id) AS collective_count,
        COUNT(DISTINCT participation.banda_id) AS band_count,
        COUNT(DISTINCT day.fecha) AS date_count
      FROM evento_edicion edition
      LEFT JOIN participacion_edicion participation
        ON participation.edicion_id = edition.id
      LEFT JOIN evento_edicion_dia day ON day.evento_edicion_id = edition.id
      WHERE edition.slug = 'temp' AND edition.published = 1
      GROUP BY edition.id
    `)

    expect(result.rows).toHaveLength(1)
    const edition = result.rows[0]
    expect(Number(edition?.participation_count)).toBe(60)
    expect(Number(edition?.artist_count)).toBeGreaterThan(0)
    expect(Number(edition?.date_count)).toBeGreaterThanOrEqual(2)
    expect(Number(edition?.collective_count)).toBeGreaterThanOrEqual(2)
    expect(Number(edition?.band_count)).toBeGreaterThan(0)

    const fixtureCounts = await client.execute(`
      SELECT
        (SELECT COUNT(*) FROM artista) AS artist_count,
        (SELECT COUNT(*) FROM catalogo_artista) AS catalog_count
    `)
    expect(Number(fixtureCounts.rows[0]?.artist_count)).toBe(70)
    expect(Number(fixtureCounts.rows[0]?.catalog_count)).toBe(38)
  })

  test('alias resolution and pseudonym ownership cover canonical, retired, and secondary names', async () => {
    const client = await freshSeededDatabase()
    const alias = await client.execute(`
      SELECT COUNT(*) AS match_count
      FROM artista_slug_alias alias
      JOIN artista artist ON artist.id = alias.artista_id
      WHERE alias.slug = 'fixture-artist-001-legacy'
        AND artist.slug = 'fixture-artist-001'
    `)
    expect(Number(alias.rows[0]?.match_count)).toBe(1)

    const pseudonyms = await client.execute(`
      SELECT
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) AS retired_count,
        SUM(CASE WHEN deleted_at IS NULL AND id <> principal.pseudonimo_id
          THEN 1 ELSE 0 END) AS active_secondary_count
      FROM artista_pseudonimo pseudonym
      JOIN artista_pseudonimo_principal principal
        ON principal.artista_id = pseudonym.artista_id
      WHERE pseudonym.artista_id = 1
    `)
    expect(Number(pseudonyms.rows[0]?.retired_count)).toBeGreaterThanOrEqual(1)
    expect(Number(pseudonyms.rows[0]?.active_secondary_count)).toBeGreaterThanOrEqual(1)

    const membership = await client.execute(`
      SELECT COUNT(*) AS valid_count
      FROM agrupacion_artista member
      JOIN artista_pseudonimo pseudonym
        ON pseudonym.id = member.pseudonimo_id
       AND pseudonym.artista_id = member.artista_id
      WHERE member.pseudonimo_id IS NOT NULL
        AND pseudonym.deleted_at IS NULL
    `)
    expect(Number(membership.rows[0]?.valid_count)).toBeGreaterThan(0)
  })

  test('inactive historical member retains collective credit in a prior edition', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT COUNT(*) AS retained_count
      FROM agrupacion_artista member
      JOIN participacion_edicion participation
        ON participation.agrupacion_id = member.agrupacion_id
      JOIN evento_edicion edition ON edition.id = participation.edicion_id
      WHERE member.agrupacion_id = 1 AND member.artista_id = 3
        AND member.activo = 0 AND edition.slug <> 'temp'
    `)

    expect(Number(result.rows[0]?.retained_count)).toBeGreaterThan(0)
  })

  test('personal fixture fields contain synthetic contact and legal identifiers only', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT
        (SELECT COUNT(*) FROM artista
          WHERE nombre NOT GLOB 'Fixture Person [0-9][0-9][0-9]'
             OR pseudonimo NOT GLOB 'Fixture Artist [0-9][0-9][0-9]') AS non_fixture_names,
        (SELECT COUNT(*) FROM artista
          WHERE correo IS NOT NULL AND correo NOT LIKE '%@example.invalid') AS non_fixture_emails,
        (SELECT COUNT(*) FROM artista_historial
          WHERE correo IS NOT NULL AND correo NOT LIKE '%@example.invalid') AS non_fixture_history_emails,
        (SELECT COUNT(*) FROM artista
          WHERE rut IS NOT NULL AND rut NOT GLOB 'FIXTURE-ID-[0-9][0-9][0-9]') AS non_fixture_ids,
        (SELECT COUNT(*) FROM artista WHERE telefono IS NOT NULL) AS phone_count,
        (SELECT COUNT(*) FROM artista
          WHERE rrss IS NOT NULL AND lower(rrss) NOT LIKE '%example.invalid%') AS non_fixture_social_domains,
        (SELECT COUNT(*) FROM artista_historial
          WHERE rrss IS NOT NULL AND lower(rrss) NOT LIKE '%example.invalid%') AS non_fixture_history_social_domains,
        (SELECT COUNT(*) FROM band
          WHERE email IS NOT NULL AND lower(email) NOT LIKE '%@example.invalid') AS non_fixture_band_emails,
        (SELECT COUNT(*) FROM agrupacion
          WHERE correo IS NOT NULL AND lower(correo) NOT LIKE '%@example.invalid') AS non_fixture_collective_emails,
        (SELECT COUNT(*) FROM lugar
          WHERE url IS NOT NULL AND lower(url) NOT LIKE 'https://example.invalid/%') AS non_fixture_venue_urls,
        (SELECT COUNT(*) FROM artista_imagen
          WHERE imagen_url IS NOT NULL
            AND imagen_url NOT GLOB 'artistas/fixture-artist-*') AS non_fixture_avatar_paths,
        (SELECT COUNT(*) FROM evento_edicion
          WHERE poster_path IS NOT NULL
            AND (poster_path NOT GLOB 'festivales/*' OR lower(poster_path) LIKE 'http%')) AS invalid_poster_paths
    `)
    const privacy = result.rows[0]

    expect(Number(privacy?.non_fixture_names)).toBe(0)
    expect(Number(privacy?.non_fixture_emails)).toBe(0)
    expect(Number(privacy?.non_fixture_history_emails)).toBe(0)
    expect(Number(privacy?.non_fixture_ids)).toBe(0)
    expect(Number(privacy?.phone_count)).toBe(0)
    expect(Number(privacy?.non_fixture_social_domains)).toBe(0)
    expect(Number(privacy?.non_fixture_history_social_domains)).toBe(0)
    expect(Number(privacy?.non_fixture_band_emails)).toBe(0)
    expect(Number(privacy?.non_fixture_collective_emails)).toBe(0)
    expect(Number(privacy?.non_fixture_venue_urls)).toBe(0)
    expect(Number(privacy?.non_fixture_avatar_paths)).toBe(0)
    expect(Number(privacy?.invalid_poster_paths)).toBe(0)
  })

  test('complete seed preserves foreign-key integrity', async () => {
    const client = await freshSeededDatabase()
    const violations = await client.execute('PRAGMA foreign_key_check')

    expect(violations.rows).toEqual([])
  })
})
