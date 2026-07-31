/**
 * Output format for all processed assets.
 *
 * The preparation pipeline converts every uploaded asset to this format
 * regardless of the original file type. This is THE single source of truth
 * for what format the storage layer receives.
 *
 * Change this in one place when the team decides to switch output formats.
 */
export const ASSET_OUTPUT_FORMAT = {
  mimeType: 'image/webp',
  extension: 'webp',
} as const

export type AssetOutputFormat = typeof ASSET_OUTPUT_FORMAT
