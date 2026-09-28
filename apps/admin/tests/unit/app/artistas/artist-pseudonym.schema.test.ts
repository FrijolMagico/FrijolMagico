import { describe, expect, test } from 'bun:test'
import {
  artistPseudonymMutationSchema,
  createArtistWithPseudonymsSchema
} from '@/core/artistas/_schemas/artist-pseudonym.schema'

describe('artist pseudonym mutation contracts', () => {
  test('requires a non-empty pseudonym list containing the chosen primary name', () => {
    const base = {
      artist: {
        slug: 'artist',
        nombre: 'Name',
        rut: null,
        telefono: null,
        correo: null,
        ciudad: null,
        pais: null,
        estadoId: 1,
        rrss: null
      },
      pseudonyms: ['Artist', 'Stage Name'],
      primaryPseudonym: 'Stage Name'
    }

    expect(createArtistWithPseudonymsSchema.safeParse(base).success).toBe(true)
    expect(
      createArtistWithPseudonymsSchema.safeParse({ ...base, primaryPseudonym: 'Missing' }).success
    ).toBe(false)
    expect(createArtistWithPseudonymsSchema.safeParse({ ...base, pseudonyms: [] }).success).toBe(false)
    expect(
      createArtistWithPseudonymsSchema.safeParse({
        ...base,
        pseudonyms: ['Artist', 'Artist']
      }).success
    ).toBe(false)
  })

  test('accepts stable-ID operations and defaults optional history/reassignment flags', () => {
    expect(
      artistPseudonymMutationSchema.parse({
        operation: 'rename',
        artistId: 7,
        pseudonymId: 13,
        pseudonym: 'New Name'
      })
    ).toMatchObject({ preserveHistory: false })
    expect(
      artistPseudonymMutationSchema.parse({
        operation: 'retire',
        artistId: 7,
        pseudonymId: 13
      }).operation
    ).toBe('retire')
    expect(
      artistPseudonymMutationSchema.parse({
        operation: 'add',
        artistId: 7,
        pseudonym: 'New Name'
      })
    ).toMatchObject({ makePrimary: false })
  })

  test('rejects invalid IDs, blank names and self-reassignment', () => {
    const validRetirement = {
      operation: 'retire',
      artistId: 7,
      pseudonymId: 13,
      reassignToPseudonymId: 13
    }
    expect(artistPseudonymMutationSchema.safeParse(validRetirement).success).toBe(false)
    expect(
      artistPseudonymMutationSchema.safeParse({
        operation: 'set-primary',
        artistId: 0,
        pseudonymId: 13
      }).success
    ).toBe(false)
    expect(
      artistPseudonymMutationSchema.safeParse({
        operation: 'add',
        artistId: 7,
        pseudonym: '   '
      }).success
    ).toBe(false)
  })
})
