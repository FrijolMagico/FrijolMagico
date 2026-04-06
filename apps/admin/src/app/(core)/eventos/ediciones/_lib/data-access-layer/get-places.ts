import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { asc } from 'drizzle-orm'
import { PLACE_CACHE_TAG } from '@/core/eventos/ediciones/_constants'
import type { Place } from '@/core/eventos/ediciones/_schemas/place.schema'

const { place } = core

export async function getPlaces(): Promise<Place[]> {
  'use cache'
  cacheTag(PLACE_CACHE_TAG)

  return db
    .select({
      id: place.id,
      nombre: place.nombre,
      direccion: place.direccion,
      ciudad: place.ciudad,
      coordenadas: place.coordenadas,
      url: place.url
    })
    .from(place)
    .orderBy(asc(place.nombre))
}
