import type { AssetTarget } from './contracts'
import type { AssetOperationPolicy } from './asset-operation-contracts'

export type RegisteredAssetOperationPolicy<
  TUpload = unknown,
  TPersist = unknown,
  TCleanup = unknown
> = AssetOperationPolicy<TUpload, TPersist, TCleanup>

export interface AssetOperationPolicyRegistry {
  register<TUpload, TPersist, TCleanup>(
    target: AssetTarget,
    policy: AssetOperationPolicy<TUpload, TPersist, TCleanup>
  ): void
  resolve<TUpload, TPersist, TCleanup>(
    target: AssetTarget
  ): RegisteredAssetOperationPolicy<TUpload, TPersist, TCleanup> | undefined
}

export function createAssetOperationPolicyRegistry(): AssetOperationPolicyRegistry {
  const policies = new Map<AssetTarget, unknown>()

  return {
    register(target, policy) {
      if (policies.has(target)) {
        throw new Error(
          `Asset operation policy already registered for target: ${target}`
        )
      }

      policies.set(target, policy)
    },

    resolve<TUpload, TPersist, TCleanup>(target: AssetTarget) {
      return policies.get(target) as
        | RegisteredAssetOperationPolicy<TUpload, TPersist, TCleanup>
        | undefined
    }
  }
}
