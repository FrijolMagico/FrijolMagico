import { closeTursoClient } from '@/infra/services/tursoClient'

import type { ImporterRegistry, ImportOptions, ImportResult } from './types'
import { catalogArtistasImporter } from './importers/catalogArtistasImporter'

// Registry of available importers
const importers: ImporterRegistry = {
  'catalog-artistas': catalogArtistasImporter,
}

// =============================================================================
// CLI
// =============================================================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color?: keyof typeof COLORS) {
  if (color) {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`)
  } else {
    console.log(message)
  }
}

function printUsage() {
  log('\n=== Frijol Mágico - Database Import Tool ===\n', 'blue')
  log('Usage:', 'cyan')
  log('  bun run db:import -- --importer=<name> [options]\n')
  log('Options:', 'cyan')
  log('  --importer=<name>  Name of the importer to run (required)')
  log('  --dry-run          Simulate import without writing to database')
  log('  --verbose          Show detailed progress')
  log('  --list             List all available importers\n')
  log('Examples:', 'cyan')
  log('  bun run db:import -- --list')
  log('  bun run db:import -- --importer=catalog-artistas --dry-run')
  log('  bun run db:import -- --importer=catalog-artistas --verbose\n')
}

function printImportersList() {
  log('\n=== Available Importers ===\n', 'blue')

  const names = Object.keys(importers)

  if (names.length === 0) {
    log('No importers registered yet.', 'yellow')
    log('Create importers in src/infra/db/imports/importers/\n')
    return
  }

  for (const name of names) {
    const importer = importers[name]
    log(`${name}`, 'green')
    log(`  Description: ${importer.description}`)
    log(`  Sheet ID: ${importer.sheetConfig.sheetId || '(not set)'}`)
    log(`  Tables: ${importer.targetTables.join(', ')}\n`)
  }
}

function printResult(result: ImportResult) {
  log('\n=== Import Result ===\n', 'blue')
  log(`Importer: ${result.importer}`)
  log(`Tables: ${result.tables.join(', ')}`)
  log(`Duration: ${result.durationMs}ms\n`)

  log(`Inserted: ${result.inserted}`, 'green')
  log(`Updated: ${result.updated}`, 'cyan')
  log(`Skipped: ${result.skipped}`, 'yellow')

  if (result.errors.length > 0) {
    log(`\nErrors: ${result.errors.length}`, 'red')
    for (const error of result.errors.slice(0, 10)) {
      log(`  Row ${error.row}: ${error.message}`, 'red')
    }
    if (result.errors.length > 10) {
      log(`  ... and ${result.errors.length - 10} more errors`, 'red')
    }
  }

  log('')
}

function parseArgs(args: string[]): {
  importer?: string
  dryRun: boolean
  verbose: boolean
  list: boolean
  help: boolean
} {
  const result = {
    importer: undefined as string | undefined,
    dryRun: false,
    verbose: false,
    list: false,
    help: false,
  }

  for (const arg of args) {
    if (arg.startsWith('--importer=')) {
      result.importer = arg.split('=')[1]
    } else if (arg === '--dry-run') {
      result.dryRun = true
    } else if (arg === '--verbose') {
      result.verbose = true
    } else if (arg === '--list') {
      result.list = true
    } else if (arg === '--help' || arg === '-h') {
      result.help = true
    }
  }

  return result
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || process.argv.length <= 2) {
    printUsage()
    process.exit(0)
  }

  if (args.list) {
    printImportersList()
    process.exit(0)
  }

  if (!args.importer) {
    log('Error: --importer is required\n', 'red')
    printUsage()
    process.exit(1)
  }

  const importer = importers[args.importer]

  if (!importer) {
    log(`Error: Unknown importer "${args.importer}"\n`, 'red')
    log('Available importers:', 'cyan')
    for (const name of Object.keys(importers)) {
      log(`  - ${name}`)
    }
    log('')
    process.exit(1)
  }

  const options: ImportOptions = {
    dryRun: args.dryRun,
    verbose: args.verbose,
  }

  log(`\n=== Running Importer: ${importer.name} ===\n`, 'blue')
  log(`Description: ${importer.description}`)
  log(`Sheet ID: ${importer.sheetConfig.sheetId || '(not set)'}`)
  log(`Tables: ${importer.targetTables.join(', ')}`)

  if (options.dryRun) {
    log('\n[DRY RUN MODE - No changes will be made]\n', 'yellow')
  }

  try {
    const result = await importer.run(options)
    printResult(result)

    if (result.errors.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    log(`\nFatal error: ${(error as Error).message}\n`, 'red')
    process.exit(1)
  } finally {
    closeTursoClient()
  }
}

main()
