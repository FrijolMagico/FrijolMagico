/**
 * Migration script to regenerate catalog order keys using fractional-indexing.
 * 
 * Run with: TURSO_DATABASE_URL=file:local.db bun run data/catalog-order-migration.ts
 */
import { eq } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from '../src/drizzle'
import { artist } from '../src/db/schema/index'

async function migrate() {
  console.log('Starting catalog order migration...')

  // Get all catalog artists ordered by current orden
  const currentItems = await db
    .select({
      id: artist.catalogArtist.id,
      orden: artist.catalogArtist.orden
    })
    .from(artist.catalogArtist)
    .orderBy(artist.catalogArtist.orden)

  console.log(`Found ${currentItems.length} catalog artists`)

  // Generate new keys sequentially using fractional-indexing
  let lastKey: string | null = null
  const updates: { id: number; oldOrden: string; newOrden: string }[] = []

  for (const item of currentItems) {
    const newKey = generateKeyBetween(lastKey, null)
    updates.push({ id: item.id, oldOrden: item.orden, newOrden: newKey })
    
    await db
      .update(artist.catalogArtist)
      .set({ orden: newKey })
      .where(eq(artist.catalogArtist.id, item.id))

    lastKey = newKey
  }

  console.log('\nMigration complete!')
  console.log('Changes:')
  for (const u of updates) {
    console.log(`  ${u.id}: ${u.oldOrden} -> ${u.newOrden}`)
  }
}

migrate().catch(console.error)
