import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const { getAssetReceiptSecret } =
  await import('@/shared/assets-manager/server/asset-receipt-config')

describe('asset receipt config', () => {
  test('returns the configured server-only receipt secret', () => {
    const previous = process.env.ASSET_RECEIPT_SECRET
    process.env.ASSET_RECEIPT_SECRET = 'server-held-secret'

    try {
      expect(getAssetReceiptSecret()).toBe('server-held-secret')
    } finally {
      process.env.ASSET_RECEIPT_SECRET = previous
    }
  })

  test('fails closed when the receipt secret is unavailable', () => {
    const previous = process.env.ASSET_RECEIPT_SECRET
    delete process.env.ASSET_RECEIPT_SECRET

    try {
      expect(() => getAssetReceiptSecret()).toThrow(
        'ASSET_RECEIPT_SECRET is not configured'
      )
    } finally {
      process.env.ASSET_RECEIPT_SECRET = previous
    }
  })
})
