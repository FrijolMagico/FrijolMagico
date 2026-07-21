import type { AssetTarget } from '../client/contracts'

const TARGET_PREFIXES: Record<AssetTarget, string> = {
  'artist-avatar': 'artist-avatar',
  'edition-poster': 'edition-poster',
}

export function deriveObjectKey(
  target: AssetTarget,
  entityId: string,
  version: string,
): string {
  const prefix = TARGET_PREFIXES[target]
  return `${prefix}/${entityId}/${version}.webp`
}
