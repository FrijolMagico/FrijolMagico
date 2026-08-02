import { createHmac } from 'node:crypto'

import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const { createProvisionalAssetReceipt, verifyProvisionalAssetReceipt } =
  await import('@/shared/assets-manager/server/provisional-asset-receipt')

const secret = 'receipt-secret-for-tests'
const claims = { subjectId: 'admin-1', assetKey: 'tmp/object.webp' }
const rejectsAssetClaims = (_value: unknown): _value is typeof claims => false

function isAssetClaims(value: unknown): value is typeof claims {
  return (
    typeof value === 'object' &&
    value !== null &&
    'subjectId' in value &&
    'assetKey' in value &&
    typeof value.subjectId === 'string' &&
    typeof value.assetKey === 'string'
  )
}

function isGenericAssetClaims(value: unknown): value is { assetKey: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'assetKey' in value &&
    typeof value.assetKey === 'string'
  )
}

describe('provisional asset receipt', () => {
  test('issues the approved legacy flat receipt bytes and accepts exact expiry', () => {
    const receipt = createProvisionalAssetReceipt(claims, {
      secret,
      issuedAt: 1_000
    })

    expect(receipt).toBe(
      'eyJzdWJqZWN0SWQiOiJhZG1pbi0xIiwiYXNzZXRLZXkiOiJ0bXAvb2JqZWN0LndlYnAiLCJpc3N1ZWRBdCI6MTAwMCwiZXhwaXJlc0F0IjozMDEwMDB9.UOINE3mlER0o-G-Io0PBHqEhisBDhNWzyPEhliEprCk'
    )
    expect(
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        now: 301_000,
        validateClaims: isGenericAssetClaims
      })
    ).toEqual({ ...claims, issuedAt: 1_000, expiresAt: 301_000 })
  })

  test('omits undefined claims and preserves the five-minute lifetime', () => {
    const receipt = createProvisionalAssetReceipt(
      { ...claims, optional: undefined },
      { secret, issuedAt: 1_000 }
    )

    expect(
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        now: 1_001,
        validateClaims: isGenericAssetClaims
      })
    ).toEqual({ ...claims, issuedAt: 1_000, expiresAt: 301_000 })
  })

  test('rejects malformed, forged, wrong-subject, rejected, and normally expired receipts', () => {
    const receipt = createProvisionalAssetReceipt(claims, {
      secret,
      issuedAt: 1_000
    })
    const options = {
      secret,
      subjectId: 'admin-1',
      validateClaims: isAssetClaims
    }
    const invalidPayload = Buffer.from('not json').toString('base64url')
    const signedInvalidPayload = `${invalidPayload}.${createHmac(
      'sha256',
      secret
    )
      .update(invalidPayload)
      .digest('base64url')}`

    expect(() => verifyProvisionalAssetReceipt('invalid', options)).toThrow(
      'INVALID_RECEIPT'
    )
    expect(() =>
      verifyProvisionalAssetReceipt(signedInvalidPayload, options)
    ).toThrow('INVALID_RECEIPT')
    expect(() => verifyProvisionalAssetReceipt(`${receipt}x`, options)).toThrow(
      'INVALID_RECEIPT'
    )
    expect(() =>
      verifyProvisionalAssetReceipt(receipt.split('.')[0] + '.x', options)
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyProvisionalAssetReceipt(receipt, {
        ...options,
        subjectId: 'admin-2'
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyProvisionalAssetReceipt(receipt, {
        ...options,
        validateClaims: rejectsAssetClaims
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyProvisionalAssetReceipt(receipt, { ...options, now: 301_001 })
    ).toThrow('INVALID_RECEIPT')
  })

  test('accepts an authentic expired receipt only for explicit cleanup', () => {
    const receipt = createProvisionalAssetReceipt(claims, {
      secret,
      issuedAt: 1_000
    })

    expect(
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subjectId: 'admin-1',
        now: 301_001,
        purpose: 'cleanup',
        validateClaims: isGenericAssetClaims
      })
    ).toEqual({ ...claims, issuedAt: 1_000, expiresAt: 301_000 })
  })

  test('binds a generic subject to independent persistence and cleanup deadlines', () => {
    const receipt = createProvisionalAssetReceipt(
      { assetKey: 'tmp/object.webp' },
      {
        secret,
        subject: 'admin-1',
        issuedAt: 1_000,
        deadlines: { persistUntil: 3_601_000, discardUntil: 604_801_000 }
      }
    )

    expect(
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subject: 'admin-1',
        now: 3_601_000,
        validateClaims: isGenericAssetClaims
      })
    ).toMatchObject({ assetKey: 'tmp/object.webp', subject: 'admin-1' })
    expect(() =>
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subject: 'admin-2',
        now: 3_601_000,
        validateClaims: isGenericAssetClaims
      })
    ).toThrow('INVALID_RECEIPT')
    expect(() =>
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subject: 'admin-1',
        now: 3_601_001,
        validateClaims: isGenericAssetClaims
      })
    ).toThrow('INVALID_RECEIPT')
    expect(
      verifyProvisionalAssetReceipt(receipt, {
        secret,
        subject: 'admin-1',
        now: 604_801_000,
        purpose: 'cleanup',
        validateClaims: isGenericAssetClaims
      })
    ).toMatchObject({ assetKey: 'tmp/object.webp', subject: 'admin-1' })
  })
})
