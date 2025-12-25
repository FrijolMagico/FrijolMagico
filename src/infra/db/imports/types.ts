import type { CMSConfig } from '@/infra/getDataFromCMS'

/**
 * Options passed to an importer via CLI
 */
export interface ImportOptions {
  /** If true, don't write to database, just simulate */
  dryRun: boolean
  /** If true, show detailed progress */
  verbose: boolean
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  /** Name of the importer that was run */
  importer: string
  /** Target table(s) affected */
  tables: string[]
  /** Number of records inserted */
  inserted: number
  /** Number of records updated */
  updated: number
  /** Number of records skipped (already existed, no changes) */
  skipped: number
  /** Errors encountered during import */
  errors: ImportError[]
  /** Duration of the import in milliseconds */
  durationMs: number
}

/**
 * Error encountered during import
 */
export interface ImportError {
  /** Row number or identifier where the error occurred */
  row: number | string
  /** Error message */
  message: string
  /** Original data that caused the error */
  data?: Record<string, unknown>
}

/**
 * Interface that all importers must implement
 */
export interface Importer {
  /** Unique identifier for this importer */
  name: string
  /** Human-readable description */
  description: string
  /** Google Sheets configuration */
  sheetConfig: CMSConfig
  /** Target tables this importer writes to */
  targetTables: string[]
  /** Run the import */
  run(options: ImportOptions): Promise<ImportResult>
}

/**
 * Registry of available importers
 */
export type ImporterRegistry = Record<string, Importer>
