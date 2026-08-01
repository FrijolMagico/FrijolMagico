/**
 * Configuration for the dev R2 reset script (`bun run reset:dev-r2`).
 *
 * This file is code, not runtime input: changing it requires a commit, so the
 * safety guarantees of the script cannot be overridden from an environment.
 */

import type { DevR2Config } from './types'

export const devR2Config: DevR2Config = {
  devBucketName: 'dev-frijolmagico-cdn',
  assetColumns: {
    artista_imagen: ['imagen_url'],
    evento_edicion: ['poster_url', 'poster_path']
  },
  excludedFolders: ['asoc/'],
  preserveSeedAssets: true,
  deleteBatchSize: 1000,
  maxObjectsToDelete: null
}
