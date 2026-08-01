export interface ManagedAssetReference {
  path: string | null
  version: string | null
}

export function hasValidManagedAssetReference(
  reference: ManagedAssetReference
): boolean {
  return reference.path !== null || reference.version === null
}
