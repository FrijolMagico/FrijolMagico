import type { AssetOutputFormat } from '../format-config'

export const ASSET_TARGET = {
  ARTIST_AVATAR: 'artist-avatar',
  EDITION_POSTER: 'edition-poster'
} as const

export type AssetTarget = (typeof ASSET_TARGET)[keyof typeof ASSET_TARGET]

export const PREPARATION_PHASE = {
  VALIDATING: 'validating',
  DECODING: 'decoding',
  OPTIMIZING: 'optimizing',
  READY: 'ready',
  ERROR: 'error',
  CANCELLED: 'cancelled'
} as const

export type PreparationPhase =
  (typeof PREPARATION_PHASE)[keyof typeof PREPARATION_PHASE]

export interface ImageDimensions {
  width: number
  height: number
}

export type ResizeDimensions = ImageDimensions

export interface ResizeSpec {
  resolve: (image: ImageDimensions) => ResizeDimensions | null
  invalidDimensionsMessage?: string
  quality?: number
}

export interface PreparedAsset {
  blob: Blob
  width: number
  height: number
  mimeType: AssetOutputFormat['mimeType']
  extension?: AssetOutputFormat['extension']
}

export interface LocalPreviewHandle {
  readonly url: string
  release: () => void
}
