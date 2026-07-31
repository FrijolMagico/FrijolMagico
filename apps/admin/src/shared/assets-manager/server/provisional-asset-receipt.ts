import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

export const PROVISIONAL_ASSET_RECEIPT_TTL_MS = 5 * 60 * 1_000
export const INVALID_PROVISIONAL_ASSET_RECEIPT = 'INVALID_RECEIPT'

type ReceiptClaims = { subjectId: string }
type ReceiptTimes = { issuedAt: number; expiresAt: number }

export type VerificationPurpose = 'authorization' | 'cleanup'

interface CreateReceiptOptions {
  secret: string
  issuedAt?: number
}

interface VerifyReceiptOptions<T extends ReceiptClaims> {
  secret: string
  subjectId: string
  now?: number
  purpose?: VerificationPurpose
  validateClaims: (value: unknown) => value is T
}

function invalidReceipt(): never {
  throw new Error(INVALID_PROVISIONAL_ASSET_RECEIPT)
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function isReceiptEnvelope<T extends ReceiptClaims>(
  value: unknown,
  validateClaims: (value: unknown) => value is T
): value is T & ReceiptTimes {
  return (
    typeof value === 'object' &&
    value !== null &&
    'issuedAt' in value &&
    'expiresAt' in value &&
    typeof value.issuedAt === 'number' &&
    typeof value.expiresAt === 'number' &&
    validateClaims(value)
  )
}

export function createProvisionalAssetReceipt<T extends ReceiptClaims>(
  claims: T,
  options: CreateReceiptOptions
): string {
  const issuedAt = options.issuedAt ?? Date.now()
  const payload = Buffer.from(
    JSON.stringify({
      ...claims,
      issuedAt,
      expiresAt: issuedAt + PROVISIONAL_ASSET_RECEIPT_TTL_MS
    })
  ).toString('base64url')

  return `${payload}.${sign(payload, options.secret)}`
}

export function verifyProvisionalAssetReceipt<T extends ReceiptClaims>(
  receipt: string,
  options: VerifyReceiptOptions<T>
): T & ReceiptTimes {
  const [payload, signature, extra] = receipt.split('.')
  if (!payload || !signature || extra) invalidReceipt()

  const received = Buffer.from(signature)
  const expected = Buffer.from(sign(payload, options.secret))
  if (received.length !== expected.length || !timingSafeEqual(received, expected))
    invalidReceipt()

  let decoded: unknown
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    invalidReceipt()
  }
  if (!isReceiptEnvelope(decoded, options.validateClaims)) invalidReceipt()

  const now = options.now ?? Date.now()
  if (
    decoded.subjectId !== options.subjectId ||
    (options.purpose !== 'cleanup' && decoded.expiresAt < now)
  )
    invalidReceipt()

  return decoded
}
