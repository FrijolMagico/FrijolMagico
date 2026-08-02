import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

export const PROVISIONAL_ASSET_RECEIPT_TTL_MS = 5 * 60 * 1_000
export const INVALID_PROVISIONAL_ASSET_RECEIPT = 'INVALID_RECEIPT'

export interface ReceiptDeadlines {
  persistUntil: number
  discardUntil: number
}

type ReceiptClaims = object
type ReceiptTimes = { issuedAt: number; expiresAt: number }
type ModernReceiptEnvelope = ReceiptClaims & {
  subject: string
} & ReceiptDeadlines

export type VerificationPurpose = 'authorization' | 'cleanup'

interface CreateReceiptOptions {
  secret: string
  issuedAt?: number
  subject?: string
  deadlines?: ReceiptDeadlines
}

interface ReceiptVerificationOptions<T extends ReceiptClaims> {
  secret: string
  now?: number
  purpose?: VerificationPurpose
  validateClaims: (value: unknown) => value is T
}

interface LegacyReceiptVerificationOptions<
  T extends ReceiptClaims
> extends ReceiptVerificationOptions<T> {
  subjectId: string
}

interface ModernReceiptVerificationOptions<
  T extends ReceiptClaims
> extends ReceiptVerificationOptions<T> {
  subject: string
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
): value is T & ReceiptTimes & { subjectId: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'issuedAt' in value &&
    'expiresAt' in value &&
    'subjectId' in value &&
    typeof value.issuedAt === 'number' &&
    typeof value.expiresAt === 'number' &&
    typeof value.subjectId === 'string' &&
    validateClaims(value)
  )
}

function isModernReceiptEnvelope<T extends ReceiptClaims>(
  value: unknown,
  validateClaims: (value: unknown) => value is T
): value is T & ModernReceiptEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'subject' in value &&
    'persistUntil' in value &&
    'discardUntil' in value &&
    typeof value.subject === 'string' &&
    typeof value.persistUntil === 'number' &&
    typeof value.discardUntil === 'number' &&
    validateClaims(value)
  )
}

export function createProvisionalAssetReceipt<T extends ReceiptClaims>(
  claims: T,
  options: CreateReceiptOptions
): string {
  const issuedAt = options.issuedAt ?? Date.now()
  const envelope =
    options.subject && options.deadlines
      ? { ...claims, subject: options.subject, ...options.deadlines }
      : {
          ...claims,
          issuedAt,
          expiresAt: issuedAt + PROVISIONAL_ASSET_RECEIPT_TTL_MS
        }
  const payload = Buffer.from(JSON.stringify(envelope)).toString('base64url')

  return `${payload}.${sign(payload, options.secret)}`
}

export function verifyProvisionalAssetReceipt<T extends ReceiptClaims>(
  receipt: string,
  options: LegacyReceiptVerificationOptions<T>
): T & ReceiptTimes
export function verifyProvisionalAssetReceipt<T extends ReceiptClaims>(
  receipt: string,
  options: ModernReceiptVerificationOptions<T>
): T & ModernReceiptEnvelope
export function verifyProvisionalAssetReceipt<T extends ReceiptClaims>(
  receipt: string,
  options:
    LegacyReceiptVerificationOptions<T> | ModernReceiptVerificationOptions<T>
): T & (ReceiptTimes | ModernReceiptEnvelope) {
  const [payload, signature, extra] = receipt.split('.')
  if (!payload || !signature || extra) invalidReceipt()

  const received = Buffer.from(signature)
  const expected = Buffer.from(sign(payload, options.secret))
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
  const now = options.now ?? Date.now()
  if (isModernReceiptEnvelope(decoded, options.validateClaims)) {
    const deadline =
      options.purpose === 'cleanup'
        ? decoded.discardUntil
        : decoded.persistUntil
    if (
      !('subject' in options) ||
      decoded.subject !== options.subject ||
      deadline < now
    )
      invalidReceipt()
    return decoded
  }

  if (!isReceiptEnvelope(decoded, options.validateClaims)) invalidReceipt()
  if (
    !('subjectId' in options) ||
    decoded.subjectId !== options.subjectId ||
    (options.purpose !== 'cleanup' && decoded.expiresAt < now)
  )
    invalidReceipt()

  return decoded
}
