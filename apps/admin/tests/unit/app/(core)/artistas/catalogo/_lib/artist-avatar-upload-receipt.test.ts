import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const { createArtistAvatarUploadReceipt, verifyArtistAvatarUploadReceipt } =
  await import('@/core/artistas/catalogo/_lib/artist-avatar-upload-receipt')

const secret = 'receipt-secret-for-tests'

describe('artist avatar upload receipt', () => {
  test('accepts an authentic receipt bound to its owner and artist', () => {
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: 'admin-1',
        artistaId: 42,
        path: 'artistas/test/avatar-v1.webp',
        version: 'v1',
        expectedActive: null,
        catalogId: 7,
        requestedActive: true
      },
      secret,
      1_000
    )

    expect(
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        artistaId: 42,
        now: 1_001
      })
    ).toEqual({
      subjectId: 'admin-1',
      artistaId: 42,
      path: 'artistas/test/avatar-v1.webp',
      version: 'v1',
      expectedActive: null,
      catalogId: 7,
      requestedActive: true,
      issuedAt: 1_000,
      persistUntil: 3_601_000,
      discardUntil: 604_801_000
    })
  })

  test('rejects forged, expired, and mismatched receipts', () => {
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: 'admin-1',
        artistaId: 42,
        path: 'artistas/test/avatar-v1.webp',
        version: 'v1',
        expectedActive: undefined,
        catalogId: undefined,
        requestedActive: undefined
      },
      secret,
      1_000
    )

    expect(() =>
      verifyArtistAvatarUploadReceipt(`${receipt}forged`, {
        secret,
        subjectId: 'admin-1',
        artistaId: 42,
        now: 1_001
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-2',
        artistaId: 42,
        now: 1_001
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        artistaId: 43,
        now: 1_001
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        artistaId: 42,
        now: 3_601_001
      })
    ).toThrow('INVALID_RECEIPT')
  })

  test('permits an authentic expired receipt only through the cleanup purpose', () => {
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: 'admin-1',
        artistaId: 42,
        path: 'artistas/test/avatar-v1.webp',
        version: 'v1',
        expectedActive: undefined,
        catalogId: undefined,
        requestedActive: undefined
      },
      secret,
      1_000
    )

    expect(
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        artistaId: 42,
        now: 3_601_001,
        purpose: 'cleanup'
      })
    ).toMatchObject({ artistaId: 42, path: 'artistas/test/avatar-v1.webp' })
  })

  test('refuses cleanup after its seven-day provisional window', () => {
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: 'admin-1',
        artistaId: 42,
        path: 'artistas/test/avatar-v1.webp',
        version: 'v1',
        expectedActive: undefined,
        catalogId: undefined,
        requestedActive: undefined
      },
      secret,
      1_000
    )

    expect(() =>
      verifyArtistAvatarUploadReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        artistaId: 42,
        now: 604_801_001,
        purpose: 'cleanup'
      })
    ).toThrow('INVALID_RECEIPT')
  })
})
