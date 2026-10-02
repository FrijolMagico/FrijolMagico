import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const workflowPath = join(import.meta.dir, '../../../.github/workflows/pr-checks.yml')
const workflow = readFileSync(workflowPath, 'utf8')

function step(name: string) {
  const start = workflow.indexOf(`      - name: ${name}`)
  expect(start).toBeGreaterThanOrEqual(0)
  const nextStep = workflow.indexOf('\n      - ', start + 1)
  return workflow.slice(start, nextStep === -1 ? undefined : nextStep)
}

describe('CI isolated database routing', () => {
  test('creates, migrates and seeds the same isolated mock before builds and tests', () => {
    const setup = step('Create, migrate and seed isolated CI database')
    expect(setup).toContain('set -euo pipefail')
    expect(setup).toContain('apt-get update')
    expect(setup).toContain('apt-get install -y sqlite3')
    expect(setup).toContain('bun run --filter=@frijolmagico/database migrate:ci')
    expect(setup).toContain("printf '%s\\n' 'PRAGMA foreign_keys=ON;'")
    expect(setup).toContain('cat packages/database/seed/seed.sql')
    expect(setup).toContain('| sqlite3 -bail "$MOCK_DB"')
    expect(setup.indexOf('migrate:ci')).toBeLessThan(setup.indexOf('cat packages/database/seed/seed.sql'))
    expect(setup.indexOf("printf '%s\\n' 'PRAGMA foreign_keys=ON;'")).toBeLessThan(setup.indexOf('cat packages/database/seed/seed.sql'))
    expect(setup).toContain('PRAGMA foreign_key_check;')
    expect(setup).toContain("SELECT COUNT(*) FROM catalogo_artista catalog JOIN artista ON artista.id = catalog.artista_id WHERE artista.slug IS NULL OR trim(artista.slug) = '';")
    expect(setup).toContain("SELECT COUNT(*) FROM evento_edicion WHERE slug IS NULL OR trim(slug) = '';")
    expect(setup).toContain("SELECT COUNT(*) FROM catalogo_artista;")
    expect(setup).toContain("SELECT COUNT(*) FROM evento_edicion;")
    expect(workflow.indexOf('Create, migrate and seed isolated CI database')).toBeLessThan(workflow.indexOf('      - name: Build'))
    expect(workflow.indexOf('      - name: Build')).toBeLessThan(workflow.indexOf('      - name: Test'))

    const build = step('Build')
    expect(build).toContain('bun run turbo run build')
    expect(build).not.toContain('bun run build')
    expect(build).toContain('DATA_SOURCE: local')
    expect(build).toContain('TURSO_DATABASE_URL: file:${{ github.workspace }}/packages/database/mock.local.db')
    expect(build).toContain("TURSO_AUTH_TOKEN: ''")
    expect(build).not.toMatch(/VERCEL(?:_ENV|=)/)

    const tests = step('Test')
    expect(tests).toContain('TURSO_DATABASE_URL: file:${{ github.workspace }}/packages/database/mock.local.db')
    expect(tests).toContain("TURSO_AUTH_TOKEN: ''")
  })
})
