import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { ADMISSION_MODES_CACHE_TAG } from '../_constants'

const { admissionMode } = participations

export interface AdmissionModeLookup {
  id: string
  nombre: string
}

export async function getAdmissionModes(): Promise<AdmissionModeLookup[]> {
  'use cache'
  cacheTag(ADMISSION_MODES_CACHE_TAG)

  const results = await db
    .select({ id: admissionMode.id, nombre: admissionMode.slug })
    .from(admissionMode)
    .orderBy(asc(admissionMode.slug))

  return results.map((row) => ({
    id: String(row.id),
    nombre: row.nombre
  }))
}
