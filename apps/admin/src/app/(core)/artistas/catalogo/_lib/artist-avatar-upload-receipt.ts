import type { ExpectedActiveAvatar } from './avatar-history-contracts'
import {
  createProvisionalAssetReceipt,
  INVALID_PROVISIONAL_ASSET_RECEIPT,
  type VerificationPurpose,
  verifyProvisionalAssetReceipt
} from '@/shared/assets-manager/server/provisional-asset-receipt'

export const ARTIST_AVATAR_PERSIST_TTL_MS = 60 * 60 * 1_000
export const ARTIST_AVATAR_DISCARD_TTL_MS = 7 * 24 * 60 * 60 * 1_000
const RECEIPT_TTL_MS = ARTIST_AVATAR_PERSIST_TTL_MS
const INVALID_RECEIPT = INVALID_PROVISIONAL_ASSET_RECEIPT

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
  persistUntil: number
  discardUntil: number
}

export interface VerifyArtistAvatarUploadReceiptInput {
  secret: string
  subjectId: string
  artistaId?: number
  now?: number
  purpose?: VerificationPurpose
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
    typeof value.subjectId === 'string' &&
    typeof value.artistaId === 'number' &&
    typeof value.path === 'string' &&
    typeof value.version === 'string' &&
    typeof value.issuedAt === 'number' &&
    (('expiresAt' in value && typeof value.expiresAt === 'number') ||
      ('persistUntil' in value &&
        'discardUntil' in value &&
        typeof value.persistUntil === 'number' &&
        typeof value.discardUntil === 'number')) &&
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
  return createProvisionalAssetReceipt(
    { ...input, issuedAt },
    {
      secret,
      issuedAt,
      subject: input.subjectId,
      deadlines: {
        persistUntil: issuedAt + ARTIST_AVATAR_PERSIST_TTL_MS,
        discardUntil: issuedAt + ARTIST_AVATAR_DISCARD_TTL_MS
      }
    }
  )
}

export function verifyArtistAvatarUploadReceipt(
  receipt: string,
  input: VerifyArtistAvatarUploadReceiptInput
): ArtistAvatarUploadReceiptClaims {
  const verified = verifyProvisionalAssetReceipt(receipt, {
    secret: input.secret,
    subject: input.subjectId,
    now: input.now,
    purpose: input.purpose,
    validateClaims: isClaims
  })
  const { subject: _subject, ...claims } = verified
  void _subject
  if (input.artistaId !== undefined && claims.artistaId !== input.artistaId)
    throw new Error(INVALID_RECEIPT)
  return claims
}

export { INVALID_RECEIPT, RECEIPT_TTL_MS }
