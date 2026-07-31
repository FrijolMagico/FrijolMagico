'use client'

import { getSharedAssetOperationRuntime } from '@/shared/assets-manager/client/asset-operation-runtime'

import { bootstrapArtistAvatarPolicy } from './artist-avatar-operation-policy'

export function ensureArtistAvatarPolicy(): void {
  bootstrapArtistAvatarPolicy(getSharedAssetOperationRuntime())
}

ensureArtistAvatarPolicy()
