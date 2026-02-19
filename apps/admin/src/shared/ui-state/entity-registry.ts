import type { EntityUIStateStore } from './entity-state'
import {
  JOURNAL_ENTITIES,
  type JournalEntity
} from '@/shared/lib/database-entities'

import { useOrganizationUIStore } from '@/app/(authenticated)/(admin)/general/_store/organization-ui-store'
import { useOrganizacionEquipoUIStore } from '@/app/(authenticated)/(admin)/general/_store/organizacion-equipo-ui-store'
import { useArtistaUIStore } from '@/app/(authenticated)/(admin)/artistas/catalogo/_store/artista-ui-store'
import { useCatalogoArtistaUIStore } from '@/app/(authenticated)/(admin)/artistas/catalogo/_store/catalogo-artista-ui-store'

const entityRegistry = new Map<JournalEntity, EntityUIStateStore<unknown>>()

export function registerEntity<T>(
  entity: JournalEntity,
  store: EntityUIStateStore<T>
): void {
  entityRegistry.set(entity, store as EntityUIStateStore<unknown>)
}

export function getStoreForEntity<T>(
  entity: JournalEntity
): EntityUIStateStore<T> | undefined {
  return entityRegistry.get(entity) as EntityUIStateStore<T> | undefined
}

export function getRegisteredEntities(): JournalEntity[] {
  return Array.from(entityRegistry.keys())
}

registerEntity(JOURNAL_ENTITIES.ORGANIZACION, useOrganizationUIStore)
registerEntity(
  JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
  useOrganizacionEquipoUIStore
)
registerEntity(JOURNAL_ENTITIES.ARTISTA, useArtistaUIStore)
registerEntity(JOURNAL_ENTITIES.CATALOGO_ARTISTA, useCatalogoArtistaUIStore)
