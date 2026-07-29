import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  clampAvatarHistoryIndex,
  createAvatarSequence,
  resolveAvatarIntent
} from '@/core/artistas/catalogo/_lib/artist-avatar-history'

const CATALOGO = join(
  import.meta.dir,
  '../../../../../../src/app/(core)/artistas/catalogo'
)
const ARTISTAS = join(import.meta.dir, '../../../../../src/app/(core)/artistas')

describe('catalog avatar history UI contracts', () => {
  test('keeps the active avatar first and clamps bounded history navigation', () => {
    const sequence = createAvatarSequence(
      { id: 8, path: 'artistas/current.webp', version: 'current' },
      [
        {
          id: 3,
          path: 'artistas/older.webp',
          version: null,
          deletedAt: '2026-01-02'
        },
        {
          id: 4,
          path: 'artistas/newer.webp',
          version: 'newer',
          deletedAt: '2026-01-03'
        }
      ]
    )

    expect(sequence.map((avatar) => avatar.id)).toEqual([8, 4, 3])
    expect(clampAvatarHistoryIndex(-1, sequence.length)).toBe(0)
    expect(clampAvatarHistoryIndex(4, sequence.length)).toBe(2)
  })

  test('describes unchanged and selected historical avatar intent without persistence', () => {
    const active = { id: 8, path: 'artistas/current.webp', version: 'current' }
    const historical = {
      id: 4,
      path: 'artistas/newer.webp',
      version: 'newer',
      deletedAt: '2026-01-03'
    }

    expect(resolveAvatarIntent(active, active)).toEqual({ intent: 'unchanged' })
    expect(resolveAvatarIntent(active, historical)).toEqual({
      intent: 'historical',
      avatarId: 4
    })
  })

  test('uses a keyed local history hook with accessible bounded arrows and no standalone history UI', () => {
    const hookPath = join(CATALOGO, '_hooks/use-artist-avatar-history.ts')
    const sectionPath = join(CATALOGO, '_components/artist-avatar-section.tsx')
    const updatePath = join(CATALOGO, '_components/update-catalog-dialog.tsx')

    expect(existsSync(hookPath)).toBe(true)
    const hook = readFileSync(hookPath, 'utf8')
    const section = readFileSync(sectionPath, 'utf8')
    const update = readFileSync(updatePath, 'utf8')

    expect(hook).toContain('getArtistAvatarHistoryAction')
    expect(hook).toContain('getArtistAvatarHistoryAction(artistId)')
    expect(section).toContain("aria-label='Avatar anterior'")
    expect(section).toContain("aria-label='Avatar siguiente'")
    expect(section).toContain('disabled={selectedIndex <= 0}')
    expect(section).toContain('disabled={selectedIndex >= avatars.length - 1}')
    expect(update).toContain('autoEnqueue={false}')
    expect(update).toContain("setValue('intent', nextIntent")
    expect(update).toContain('onPreparedUpload={() =>')
    expect(update).not.toContain("from './artist-avatar-history'")
  })

  test('removes manual avatar deletion and restoration actions', () => {
    expect(
      existsSync(join(ARTISTAS, '_actions/remove-artist-avatar.action.ts'))
    ).toBe(false)
    expect(
      existsSync(join(ARTISTAS, '_actions/restore-artist-avatar.action.ts'))
    ).toBe(false)
    expect(
      existsSync(join(CATALOGO, '_components/artist-avatar-history.tsx'))
    ).toBe(false)
  })
})
