import { createHmac, timingSafeEqual } from 'node:crypto'

import type { ExpectedActiveAvatar } from './avatar-history-contracts'

const RECEIPT_TTL_MS = 5 * 60 * 1_000
const INVALID_RECEIPT = 'INVALID_RECEIPT'

export interface ArtistAvatarUploadReceiptInput {
  subjectId: string
  artistaId: number
  path: string
  version: string
  expectedActive: ExpectedActiveAvatar | null | undefined
  catalogId: number | undefined
  requestedActive: boolean | undefined
}

export interface ArtistAvatarUploadReceiptClaims extends ArtistAvatarUploadReceiptInput {
  issuedAt: number
  expiresAt: number
}

export interface VerifyArtistAvatarUploadReceiptInput {
  secret: string
  subjectId: string
  artistaId?: number
  now?: number
  allowExpired?: boolean
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function invalidReceipt(): never {
  throw new Error(INVALID_RECEIPT)
}

function isExpectedActive(value: unknown): value is ExpectedActiveAvatar {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'path' in value &&
    'version' in value &&
    typeof value.id === 'number' &&
    typeof value.path === 'string' &&
    (typeof value.version === 'string' || value.version === null)
  )
}

function isClaims(value: unknown): value is ArtistAvatarUploadReceiptClaims {
  const claims = value as Partial<ArtistAvatarUploadReceiptClaims>
  return (
    typeof value === 'object' &&
    value !== null &&
    'subjectId' in value &&
    'artistaId' in value &&
    'path' in value &&
    'version' in value &&
    'issuedAt' in value &&
    'expiresAt' in value &&
    typeof value.subjectId === 'string' &&
    typeof value.artistaId === 'number' &&
    typeof value.path === 'string' &&
    typeof value.version === 'string' &&
    typeof value.issuedAt === 'number' &&
    typeof value.expiresAt === 'number' &&
    (claims.expectedActive === undefined ||
      claims.expectedActive === null ||
      isExpectedActive(claims.expectedActive)) &&
    (claims.catalogId === undefined || typeof claims.catalogId === 'number') &&
    (claims.requestedActive === undefined ||
      typeof claims.requestedActive === 'boolean')
  )
}

export function createArtistAvatarUploadReceipt(
  input: ArtistAvatarUploadReceiptInput,
  secret: string,
  issuedAt = Date.now()
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...input, issuedAt, expiresAt: issuedAt + RECEIPT_TTL_MS })
  ).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

export function verifyArtistAvatarUploadReceipt(
  receipt: string,
  input: VerifyArtistAvatarUploadReceiptInput
): ArtistAvatarUploadReceiptClaims {
  const [payload, signature, extra] = receipt.split('.')
  if (!payload || !signature || extra) invalidReceipt()

  const expectedSignature = sign(payload, input.secret)
  const received = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    invalidReceipt()

  let decoded: unknown
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    invalidReceipt()
  }
  if (!isClaims(decoded)) invalidReceipt()

  const now = input.now ?? Date.now()
  if (
    decoded.subjectId !== input.subjectId ||
    (input.artistaId !== undefined && decoded.artistaId !== input.artistaId) ||
    (!input.allowExpired && decoded.expiresAt < now)
  )
    invalidReceipt()

  return decoded
}

export { INVALID_RECEIPT, RECEIPT_TTL_MS }
