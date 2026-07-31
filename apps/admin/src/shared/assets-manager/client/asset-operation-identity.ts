import type { AssetTarget } from './contracts'

const QUEUE_ENTITY_ID_SEPARATOR = '\u0000'

export interface AssetOperationIdentity {
  target: AssetTarget
  domainEntityId: string
  queueEntityId: string
}

export function createAssetOperationIdentity(
  target: AssetTarget,
  domainEntityId: string
): AssetOperationIdentity {
  return {
    target,
    domainEntityId,
    queueEntityId: `${target}${QUEUE_ENTITY_ID_SEPARATOR}${domainEntityId}`
  }
}
