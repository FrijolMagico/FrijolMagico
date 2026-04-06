import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'

import { ADMISSION_MODES_CACHE_TAG } from '@/core/eventos/participaciones/_constants/cache-tags'

const { admissionMode } = participations

export async function getAdmissionModes(): Promise<Map<number, string>> {
  'use cache'
  cacheTag(ADMISSION_MODES_CACHE_TAG)

  const results = await db
    .select({ id: admissionMode.id, slug: admissionMode.slug })
    .from(admissionMode)
    .orderBy(asc(admissionMode.slug))

  return new Map(results.map((row) => [row.id, row.slug]))
}
