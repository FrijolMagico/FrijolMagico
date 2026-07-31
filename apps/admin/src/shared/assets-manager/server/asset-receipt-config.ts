import 'server-only'

export function getAssetReceiptSecret(): string {
  const secret = process.env.ASSET_RECEIPT_SECRET
  if (!secret) throw new Error('ASSET_RECEIPT_SECRET is not configured')
  return secret
}
