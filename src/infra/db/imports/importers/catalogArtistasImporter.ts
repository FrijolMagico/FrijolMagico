import { getDataFromCMS } from '@/infra/getDataFromCMS'
import { executeQuery } from '@/infra/services/tursoClient'
import { validateCatalogSheetRow, type CatalogSheetRow } from '@/schemas/sheets'
import {
  type ArtistaInsert,
  type RrssObject,
  urlToRrssObject,
  rrssToJson,
  jsonToRrss,
} from '@/schemas/artista'

import type {
  Importer,
  ImportOptions,
  ImportResult,
  ImportError,
} from '../types'

// =============================================================================
// Helpers - Data Transformation
// =============================================================================

/**
 * Transform validated sheet row to artista record for INSERT
 * Uses urlToRrssObject to convert the single URL to RrssObject
 */
function transformToArtista(row: CatalogSheetRow): ArtistaInsert {
  return {
    nombre: row.name.trim(),
    pseudonimo: row.name.trim(), // Same as name since sheet doesn't have real name
    correo: row.email,
    ciudad: row.city,
    pais: row.country,
    descripcion: row.bio,
    rrss: urlToRrssObject(row.rrss), // Convert URL string to RrssObject
  }
}

// =============================================================================
// Database Operations
// =============================================================================

/**
 * Find artista by pseudonimo or email (for idempotency)
 * Pseudonimo first to handle cases where multiple artists share an email (collectives)
 */
async function findArtista(
  correo: string | null,
  pseudonimo: string,
): Promise<{
  id: number
  correo: string | null
  ciudad: string | null
  pais: string | null
  descripcion: string | null
  rrss: RrssObject | null
} | null> {
  // Try by pseudonimo first (unique per artist, handles collectives with shared email)
  const { data: byPseudonimo, error: pseudoError } = await executeQuery<{
    id: number
    correo: string | null
    ciudad: string | null
    pais: string | null
    descripcion: string | null
    rrss: string | null
  }>(
    'SELECT id, correo, ciudad, pais, descripcion, rrss FROM artista WHERE pseudonimo = ?',
    [pseudonimo],
  )

  if (pseudoError) throw pseudoError
  if (byPseudonimo.length > 0) {
    return {
      ...byPseudonimo[0],
      rrss: jsonToRrss(byPseudonimo[0].rrss),
    }
  }

  // Fallback to email (for legacy cases)
  if (correo) {
    const { data: byEmail, error: emailError } = await executeQuery<{
      id: number
      correo: string | null
      ciudad: string | null
      pais: string | null
      descripcion: string | null
      rrss: string | null
    }>(
      'SELECT id, correo, ciudad, pais, descripcion, rrss FROM artista WHERE correo = ?',
      [correo],
    )

    if (emailError) throw emailError
    if (byEmail.length > 0) {
      return {
        ...byEmail[0],
        rrss: jsonToRrss(byEmail[0].rrss),
      }
    }
  }

  return null
}

/**
 * Insert new artista
 * Converts RrssObject to JSON string for storage
 */
async function insertArtista(
  artista: ArtistaInsert,
  dryRun: boolean,
): Promise<number> {
  if (dryRun) return -1

  const { data, error } = await executeQuery<{ id: number }>(
    `INSERT INTO artista (nombre, pseudonimo, correo, ciudad, pais, descripcion, rrss) 
     VALUES (?, ?, ?, ?, ?, ?, ?) 
     RETURNING id`,
    [
      artista.nombre,
      artista.pseudonimo,
      artista.correo,
      artista.ciudad,
      artista.pais,
      artista.descripcion,
      rrssToJson(artista.rrss), // Convert RrssObject to JSON string
    ],
  )

  if (error) throw error
  return data[0].id
}

/**
 * Update existing artista if data changed
 * Returns true if updated, false if no changes needed
 */
async function updateArtistaIfChanged(
  id: number,
  artista: ArtistaInsert,
  existing: {
    correo: string | null
    ciudad: string | null
    pais: string | null
    descripcion: string | null
    rrss: RrssObject | null
  },
  dryRun: boolean,
): Promise<boolean> {
  // Check if any field changed
  const correoChanged = artista.correo !== existing.correo
  const ciudadChanged = artista.ciudad !== existing.ciudad
  const paisChanged = artista.pais !== existing.pais
  const descripcionChanged = artista.descripcion !== existing.descripcion

  // Compare RRSS as JSON strings for reliable comparison
  const newRrssJson = rrssToJson(artista.rrss)
  const existingRrssJson = rrssToJson(existing.rrss)
  const rrssChanged = newRrssJson !== existingRrssJson

  if (
    !correoChanged &&
    !ciudadChanged &&
    !paisChanged &&
    !descripcionChanged &&
    !rrssChanged
  ) {
    return false // No changes
  }

  if (dryRun) return true

  const { error } = await executeQuery(
    `UPDATE artista SET correo = ?, ciudad = ?, pais = ?, descripcion = ?, rrss = ? WHERE id = ?`,
    [
      artista.correo,
      artista.ciudad,
      artista.pais,
      artista.descripcion,
      newRrssJson,
      id,
    ],
  )

  if (error) throw error
  return true
}

/**
 * Find or create agrupacion by name
 */
async function findOrCreateAgrupacion(
  nombre: string,
  dryRun: boolean,
): Promise<number> {
  // Check if exists
  const { data, error } = await executeQuery<{ id: number }>(
    'SELECT id FROM agrupacion WHERE nombre = ?',
    [nombre],
  )

  if (error) throw error

  if (data.length > 0) {
    return data[0].id
  }

  // Create new
  if (dryRun) return -1

  const insert = await executeQuery<{ id: number }>(
    'INSERT INTO agrupacion (nombre) VALUES (?) RETURNING id',
    [nombre],
  )

  if (insert.error) throw insert.error
  return insert.data[0].id
}

// =============================================================================
// Main Import Function
// =============================================================================

async function run(options: ImportOptions): Promise<ImportResult> {
  const startTime = Date.now()
  const errors: ImportError[] = []
  let inserted = 0
  let updated = 0
  let skipped = 0

  if (options.verbose) {
    console.log('\nFetching data from Google Sheets...')
  }

  // 1. Fetch data from Google Sheets
  const sheetData = await getDataFromCMS<Record<string, unknown>>({
    sheetId: process.env.CATALOG_SHEET_ID,
    sheetIndex: 0,
    startRow: 1,
  })

  if (!sheetData || !Array.isArray(sheetData)) {
    throw new Error('Failed to fetch data from Google Sheets or data is empty')
  }

  const rows = sheetData

  if (options.verbose) {
    console.log(`Found ${rows.length} rows in sheet`)
  }

  // 2. Process each row
  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2 // +1 for 0-index, +1 for header row
    const row = rows[i]

    try {
      // Validate row with Zod schema
      const validation = validateCatalogSheetRow(row)

      if (!validation.success) {
        errors.push({
          row: rowNumber,
          message: validation.errors?.join(', ') || 'Validation failed',
          data: row as Record<string, unknown>,
        })

        if (options.verbose) {
          console.log(
            `  Row ${rowNumber}: Validation ERROR - ${validation.errors?.join(', ')}`,
          )
        }
        continue
      }

      // Log warnings if any
      if (validation.warnings?.length && options.verbose) {
        console.log(
          `  Row ${rowNumber} warnings: ${validation.warnings.join(', ')}`,
        )
      }

      const validatedRow = validation.data!

      // Transform to artista record (includes rrss URL -> RrssObject conversion)
      const artista = transformToArtista(validatedRow)

      // Check if exists (idempotency)
      const existing = await findArtista(
        artista.correo,
        artista.pseudonimo ?? artista.nombre,
      )

      if (existing) {
        // Try to update if changed
        const wasUpdated = await updateArtistaIfChanged(
          existing.id,
          artista,
          existing,
          options.dryRun,
        )

        if (wasUpdated) {
          updated++
          if (options.verbose) {
            console.log(`  Row ${rowNumber}: Updated "${artista.pseudonimo}"`)
          }
        } else {
          skipped++
          if (options.verbose) {
            console.log(
              `  Row ${rowNumber}: Skipped "${artista.pseudonimo}" (no changes)`,
            )
          }
        }
      } else {
        // Insert new artista
        const artistaId = await insertArtista(artista, options.dryRun)
        inserted++

        if (options.verbose) {
          console.log(
            `  Row ${rowNumber}: Inserted "${artista.pseudonimo}" (id: ${artistaId})`,
          )
        }
      }

      // Handle collective/agrupacion (create if exists, but don't link to artista yet)
      const collectiveName = validatedRow.collective
      if (collectiveName) {
        await findOrCreateAgrupacion(collectiveName, options.dryRun)
        if (options.verbose) {
          console.log(`    - Ensured agrupacion exists: "${collectiveName}"`)
        }
      }
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: (error as Error).message,
        data: row as Record<string, unknown>,
      })

      if (options.verbose) {
        console.log(`  Row ${rowNumber}: ERROR - ${(error as Error).message}`)
      }
    }
  }

  return {
    importer: 'catalog-artistas',
    tables: ['artista', 'agrupacion'],
    inserted,
    updated,
    skipped,
    errors,
    durationMs: Date.now() - startTime,
  }
}

// =============================================================================
// Exporter
// =============================================================================

export const catalogArtistasImporter: Importer = {
  name: 'catalog-artistas',
  description: 'Import artists from Catalog Google Sheet to artista table',
  sheetConfig: {
    sheetId: process.env.CATALOG_SHEET_ID,
    sheetIndex: 0,
    startRow: 1,
  },
  targetTables: ['artista', 'agrupacion'],
  run,
}
