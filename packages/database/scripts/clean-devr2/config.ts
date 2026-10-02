/**
 * Configuration for the retired legacy manual dev R2 reset script.
 * Do not use it with real database snapshots: seed assets are not a complete
 * inventory of the assets referenced by a snapshot.
 *
 * This file is code, not runtime input; environment variables cannot override
 * its configuration.
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
