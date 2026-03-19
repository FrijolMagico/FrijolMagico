import { describe, expect, test } from 'bun:test'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'

const PROJECT_ROOT = resolve(import.meta.dir, '../../../..')

const LISTING_FEATURE_ROOTS = [
  'src/app/(core)/artistas',
  'src/app/(core)/eventos/ediciones',
  'src/app/(core)/eventos/participaciones'
] as const

const FORBIDDEN_IMPORT_FRAGMENTS = [
  '@/shared/ui-state/',
  'use-artist-list',
  'use-catalog-list',
  'use-edicion-list',
  'artist-list-filter-store',
  'artist-list-pagination-store',
  'catalog-filter-store',
  'catalog-pagination-store',
  'edicion-filter-store',
  'edicion-pagination-store',
  'participaciones-filter-store'
] as const

const INTERNAL_ALIAS_PREFIXES = {
  '@/core/': 'src/app/(core)/',
  '@/admin/': 'src/app/(core)/',
  '@/dashboard/': 'src/app/(core)/dashboard/',
  '@/auth/': 'src/app/(auth)/',
  '@/tests/': 'tests/',
  '@/': 'src/'
} as const

interface ImportReference {
  filePath: string
  source: string
}

interface UnresolvedImport extends ImportReference {
  resolvedFrom: string
}

describe('admin listing dependency graph', () => {
  test('does not reference removed list modules', () => {
    const references = collectImportReferences()
    const forbiddenReferences = references
      .filter(({ source }) =>
        FORBIDDEN_IMPORT_FRAGMENTS.some((fragment) => source.includes(fragment))
      )
      .map(formatReference)

    expect(forbiddenReferences).toEqual([])
  })

  test('resolves internal imports for migrated listing features', () => {
    const unresolvedImports = collectImportReferences()
      .map((reference) => {
        const resolvedFrom = resolveInternalImport(
          reference.filePath,
          reference.source
        )

        if (resolvedFrom === null) {
          return null
        }

        return moduleExists(resolvedFrom)
          ? null
          : {
              ...reference,
              resolvedFrom
            }
      })
      .filter((value): value is UnresolvedImport => value !== null)
      .map(
        ({ filePath, source, resolvedFrom }) =>
          `${toProjectRelativePath(filePath)} -> ${source} (${toProjectRelativePath(resolvedFrom)})`
      )

    expect(unresolvedImports).toEqual([])
  })
})

function collectImportReferences(): ImportReference[] {
  return LISTING_FEATURE_ROOTS.flatMap((directory) => {
    const absoluteDirectory = resolve(PROJECT_ROOT, directory)

    return collectCodeFiles(absoluteDirectory).flatMap((filePath) =>
      extractImportSources(filePath).map((source) => ({ filePath, source }))
    )
  })
}

function collectCodeFiles(directoryPath: string): string[] {
  return readdirSync(directoryPath, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directoryPath, entry.name)

      if (entry.isDirectory()) {
        return collectCodeFiles(entryPath)
      }

      return isCodeFile(entryPath) ? [entryPath] : []
    })
    .sort((left, right) => left.localeCompare(right))
}

function isCodeFile(filePath: string): boolean {
  const extension = extname(filePath)

  return extension === '.ts' || extension === '.tsx'
}

function extractImportSources(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8')
  const matches = content.matchAll(
    /\b(?:import|export)\b(?:[\s\S]*?\bfrom\s*)?['"]([^'"]+)['"]/g
  )

  return Array.from(matches, (match) => match[1])
}

function resolveInternalImport(
  fromFilePath: string,
  source: string
): string | null {
  if (source.startsWith('.')) {
    return resolve(dirname(fromFilePath), source)
  }

  for (const [prefix, target] of Object.entries(INTERNAL_ALIAS_PREFIXES)) {
    if (source.startsWith(prefix)) {
      return resolve(PROJECT_ROOT, target, source.slice(prefix.length))
    }
  }

  return null
}

function moduleExists(modulePath: string): boolean {
  const candidatePaths = [
    modulePath,
    `${modulePath}.ts`,
    `${modulePath}.tsx`,
    `${modulePath}.js`,
    `${modulePath}.jsx`,
    join(modulePath, 'index.ts'),
    join(modulePath, 'index.tsx'),
    join(modulePath, 'index.js'),
    join(modulePath, 'index.jsx')
  ]

  return candidatePaths.some((candidatePath) => {
    if (!existsSync(candidatePath)) {
      return false
    }

    return statSync(candidatePath).isFile()
  })
}

function formatReference(reference: ImportReference): string {
  return `${toProjectRelativePath(reference.filePath)} -> ${reference.source}`
}

function toProjectRelativePath(filePath: string): string {
  return filePath.startsWith(PROJECT_ROOT)
    ? filePath.slice(PROJECT_ROOT.length + 1)
    : filePath
}
