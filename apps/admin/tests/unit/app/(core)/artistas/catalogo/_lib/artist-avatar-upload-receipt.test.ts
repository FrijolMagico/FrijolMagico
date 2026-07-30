import { describe, expect, test } from 'bun:test'

import {
  createArtistAvatarUploadReceipt,
  verifyArtistAvatarUploadReceipt
} from '@/core/artistas/catalogo/_lib/artist-avatar-upload-receipt'

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
      expiresAt: 301_000
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
        now: 301_001
      })
    ).toThrow('INVALID_RECEIPT')
  })
})
