import { createProjectionStore } from '@/shared/operations/projection'
import { CatalogEntry } from '../_types'
import { createEntityOperationStore } from '@/shared/operations/log'

export const useCatalogOperationStore =
  createEntityOperationStore<CatalogEntry>()

export const useCatalogProjectionStore = createProjectionStore<CatalogEntry>()
