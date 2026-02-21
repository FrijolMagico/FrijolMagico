'use server'

import { revalidateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'

import { clearSection } from '@/shared/change-journal/change-journal'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { getLatestEntries } from '../lib/journal-reader'
import {
  mapToEventoInput,
  mapToEventoEdicionInput,
  mapToEventoEdicionDiaInput
} from '../mappers/evento.mapper'
import { isTempId, createIdMapping } from '../lib/id-mapper'
import { sortOperations, validateOperations } from '../lib/operation-sorter'
import type { SaveResult, IdMapping, SectionName } from '../lib/types'

export async function saveEvento(section: SectionName): Promise<SaveResult> {
  if (section !== 'evento') {
    return {
      success: false,
      error: 'Invalid section. Expected "evento"',
      errorCode: 'VALIDATION_ERROR'
    }
  }

  try {
    const entries = await getLatestEntries(section)

    if (entries.length === 0) {
      return {
        success: true,
        mappings: [],
        processedCount: 0
      }
    }

    const validation = validateOperations(entries)
    if (!validation.valid) {
      return {
        success: false,
        error: `Operation validation failed: ${validation.errors.join(', ')}`,
        errorCode: 'VALIDATION_ERROR'
      }
    }

    const { deletes, updates, restores: _restores } = sortOperations(entries)

    const eventoEntries: JournalEntry[] = []
    const edicionEntries: JournalEntry[] = []
    const diaEntries: JournalEntry[] = []

    for (const entry of [...updates, ...deletes]) {
      const scopePrefix = entry.scopeKey.split(':')[0]
      if (scopePrefix.includes('evento-edicion-dia')) {
        diaEntries.push(entry)
      } else if (scopePrefix.includes('evento-edicion')) {
        edicionEntries.push(entry)
      } else if (scopePrefix.includes('evento')) {
        eventoEntries.push(entry)
      }
    }

    const mappings: IdMapping[] = []
    const tempIdMap = new Map<string, number>()

    await db.transaction(async (tx) => {
      for (const entry of eventoEntries) {
        if (entry.payload.op === 'unset') {
          const entityId = entry.scopeKey.split(':')[1]
          if (!entityId) continue

          if (isTempId(entityId)) continue

          await tx
            .delete(events.evento)
            .where(eq(events.evento.id, Number.parseInt(entityId, 10)))
        } else {
          const input = mapToEventoInput(entry)
          const entityId = entry.scopeKey.split(':')[1]

          if (input.id && !isTempId(entityId || '')) {
            await tx
              .update(events.evento)
              .set(input)
              .where(eq(events.evento.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.evento)
              .values(input)
              .returning({ id: events.evento.id })

            if (inserted && entityId) {
              tempIdMap.set(entityId, inserted.id)
              mappings.push(createIdMapping(entityId, inserted.id, 'evento'))
            }
          }
        }
      }

      for (const entry of edicionEntries) {
        if (entry.payload.op === 'unset') {
          const entityId = entry.scopeKey.split(':')[1]
          if (!entityId) continue

          if (isTempId(entityId)) {
            continue
          }

          await tx
            .delete(events.eventoEdicion)
            .where(eq(events.eventoEdicion.id, Number.parseInt(entityId, 10)))
        } else {
          const input = mapToEventoEdicionInput(entry)
          const entityId = entry.scopeKey.split(':')[1]

          if (input.eventoId && isTempId(String(input.eventoId))) {
            const realEventoId = tempIdMap.get(String(input.eventoId))
            if (realEventoId) {
              input.eventoId = realEventoId
            }
          }

          if (input.id && !isTempId(entityId || '')) {
            await tx
              .update(events.eventoEdicion)
              .set(input)
              .where(eq(events.eventoEdicion.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.eventoEdicion)
              .values(input)
              .returning({ id: events.eventoEdicion.id })

            if (inserted && entityId) {
              tempIdMap.set(entityId, inserted.id)
              mappings.push(createIdMapping(entityId, inserted.id, 'evento'))
            }
          }
        }
      }

      for (const entry of diaEntries) {
        if (entry.payload.op === 'unset') {
          const entityId = entry.scopeKey.split(':')[1]
          if (!entityId) continue

          if (isTempId(entityId)) {
            continue
          }

          await tx
            .delete(events.eventoEdicionDia)
            .where(
              eq(events.eventoEdicionDia.id, Number.parseInt(entityId, 10))
            )
        } else {
          const input = mapToEventoEdicionDiaInput(entry)
          const entityId = entry.scopeKey.split(':')[1]

          if (isTempId(String(input.eventoEdicionId))) {
            const realEdicionId = tempIdMap.get(String(input.eventoEdicionId))
            if (realEdicionId) {
              input.eventoEdicionId = realEdicionId
            }
          }

          if (input.id && !isTempId(entityId || '')) {
            await tx
              .update(events.eventoEdicionDia)
              .set(input)
              .where(eq(events.eventoEdicionDia.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.eventoEdicionDia)
              .values(input)
              .returning({ id: events.eventoEdicionDia.id })

            if (inserted && entityId) {
              tempIdMap.set(entityId, inserted.id)
              mappings.push(createIdMapping(entityId, inserted.id, 'evento'))
            }
          }
        }
      }
    })

    await clearSection(section)

    revalidateTag('server-action', 'evento')
    revalidateTag('server-action', 'evento-edicion')
    revalidateTag('server-action', 'evento-edicion-dia')

    return {
      success: true,
      mappings,
      processedCount: entries.length
    }
  } catch (error) {
    console.error('[save-evento] Error:', error)

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al guardar evento',
      errorCode: 'DB_ERROR'
    }
  }
}
