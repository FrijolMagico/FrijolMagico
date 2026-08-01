import 'server-only'

import { AssetStoreError } from './asset-store-error'

export interface AssetStore {
  putObject(key: string, blob: Blob): Promise<void>
  deleteObject(key: string): Promise<void>
}

export function assertAssetStore(store: unknown): asserts store is AssetStore {
  if (
    !store ||
    typeof store !== 'object' ||
    typeof (store as AssetStore).putObject !== 'function' ||
    typeof (store as AssetStore).deleteObject !== 'function'
  ) {
    throw new AssetStoreError('Invalid AssetStore implementation', 'INVALID_STORE')
  }
}
