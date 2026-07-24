import 'server-only'

import type { AssetTarget } from '../client/contracts'
import type { ManagedAssetReference } from '../managed-asset-reference'

import { AssetStoreError } from './asset-store-error'

export interface AssetStore {
  uploadAsset(
    target: AssetTarget,
    entityId: string,
    blob: Blob,
  ): Promise<ManagedAssetReference>

  replaceAsset(
    target: AssetTarget,
    entityId: string,
    currentRef: ManagedAssetReference,
    blob: Blob,
  ): Promise<ManagedAssetReference>

  deleteAsset(
    target: AssetTarget,
    entityId: string,
    ref: ManagedAssetReference,
  ): Promise<void>
}

export function assertAssetStore(store: unknown): asserts store is AssetStore {
  if (
    !store ||
    typeof store !== 'object' ||
    typeof (store as AssetStore).uploadAsset !== 'function' ||
    typeof (store as AssetStore).deleteAsset !== 'function'
  ) {
    throw new AssetStoreError('Invalid AssetStore implementation', 'INVALID_STORE')
  }
}
