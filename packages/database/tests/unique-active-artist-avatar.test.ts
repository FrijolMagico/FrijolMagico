import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationPath = join(
  import.meta.dir,
  '../migrations/0020_unique_active_artist_avatar.sql'
)

describe('unique active artist avatar migration', () => {
  test('archives duplicate active avatars before creating the partial unique index', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('ROW_NUMBER() OVER')
    expect(migration).toContain("WHERE tipo = 'avatar' AND deleted_at IS NULL")
    expect(migration).toContain(
      'CREATE UNIQUE INDEX uq_artist_image_active_avatar'
    )
  })

  test('keeps the newest active avatar by created timestamp and id', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('ORDER BY created_at DESC, id DESC')
    expect(migration).toContain('WHERE ranked_active_avatars.rank > 1')
  })
})
