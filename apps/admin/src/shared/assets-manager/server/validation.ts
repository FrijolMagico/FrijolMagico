import { ValidationError } from './validation-error'
import type { AssetTarget } from '../client/contracts'

const TARGET_CONSTRAINTS: Record<AssetTarget, { width: number; height?: number }> = {
  'artist-avatar': { width: 800, height: 800 },
  'edition-poster': { width: 800 },
}

export function validatePreparedSize(
  target: AssetTarget,
  width: number,
  height: number,
): void {
  const constraints = TARGET_CONSTRAINTS[target]

  if (width <= 0 || height <= 0) {
    throw new ValidationError('Dimensions must be positive integers', 'dimensions')
  }

  if (width !== constraints.width) {
    throw new ValidationError(
      `Expected width ${constraints.width}px for ${target}, got ${width}px`,
      'preparedWidth',
    )
  }

  if (constraints.height !== undefined && height !== constraints.height) {
    throw new ValidationError(
      `Expected height ${constraints.height}px for ${target}, got ${height}px`,
      'preparedHeight',
    )
  }
}

export function assertValidAssetTarget(value: string): AssetTarget {
  if (value !== 'artist-avatar' && value !== 'edition-poster') {
    throw new ValidationError(`Invalid asset target: ${value}`, 'assetTarget')
  }
  return value
}
