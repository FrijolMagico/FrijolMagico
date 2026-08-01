/**
 * Types for the dev R2 reset script (`bun run reset:dev-r2`).
 */

/**
 * Maps seed tables to the columns that store raw R2 keys. Used by the seed
 * parser to decide which INSERT values are asset keys that must survive a
 * bucket cleanup.
 *
 * @example
 * {
 *   artista_imagen: ['imagen_url'],              // avatars
 *   evento_edicion: ['poster_url', 'poster_path'], // posters
 * }
 */
export type AssetTableColumns = Record<string, readonly string[]>

export interface DevR2Config {
  /**
   * Exact name of the development bucket. The script aborts unless
   * R2_BUCKET_NAME matches it — never point this at a production bucket.
   */
  devBucketName: string

  /**
   * Tables and columns of seed/seed.sql that hold raw R2 keys. Every value in
   * these columns becomes a preserved asset when `preserveSeedAssets` is
   * enabled. Columns holding foreign/external URLs must NOT be listed here.
   */
  assetColumns: AssetTableColumns

  /**
   * Folder prefixes excluded from deletion. Every object whose key starts
   * with one of these prefixes survives the cleanup (recursively).
   *
   * Accepted forms (all equivalent):
   * - 'artistas/*'  → everything under artists/ (recursive)
   * - 'artistas/'   → same effect, trailing-slash form
   * - 'artistas'    → same effect, bare form
   *
   * Empty array: no folder exclusions.
   */
  excludedFolders: string[]

  /**
   * Preserve the assets referenced by seed/seed.sql (the canonical seed
   * definition). When false, the seed assets are NOT protected and the
   * script relies solely on `excludedFolders` — set it only when you
   * explicitly want a full cleanup of non-excluded objects.
   */
  preserveSeedAssets: boolean

  /**
   * Maximum objects per delete request (S3 hard limit: 1000). Values above
   * 1000 are clamped down to 1000.
   */
  deleteBatchSize: number

  /**
   * Safety limit: abort without deleting anything when the number of objects
   * to delete exceeds this value. `null` disables the limit.
   */
  maxObjectsToDelete: number | null

  /**
   * How many assets to list in the plan summary. Omitted (default) lists
   * every asset to delete; a number limits the list.
   */
  sampleSize?: number
}
