import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const src = `${process.cwd()}/src/app/(core)`
const source = (path: string) => readFileSync(`${src}/${path}`, 'utf8')
const actions = 'eventos/participaciones/_actions'

const assignmentWriters = [
  'activities/create-activity.action.ts',
  'activities/update-activity-aggregate.action.ts',
  'activities/update-activity.action.ts',
  'activities/delete-activity.action.ts',
  'exhibitions/create-exhibition.action.ts',
  'exhibitions/update-exhibition.action.ts',
  'exhibitions/delete-exhibition.action.ts',
  'participations/update-participation.action.ts'
]

describe('artist detail cache dependency contract', () => {
  test('uses a detail-only tag alongside event and edition dependencies, not the broad artist tag', () => {
    const tags = readFileSync(`${process.cwd()}/../../packages/cache-tags/src/index.ts`, 'utf8')
    const dal = source('artistas/_lib/get-artist-detail.ts')
    expect(tags).toContain("ARTIST_DETAIL_CACHE_TAG = 'artistas:detalle'")
    expect(dal).toContain('ARTIST_DETAIL_CACHE_TAG,')
    expect(dal).not.toContain('ARTIST_CACHE_TAG')
    for (const tag of ['EVENT_CACHE_TAG', 'EDITION_CACHE_TAG', 'EDITION_DAY_CACHE_TAG']) {
      expect(dal).toContain(tag)
    }
  })

  test('invalidates detail on successful avatar persistence and historical restore only', () => {
    const route = source('api/assets/persist/route.ts')
    expect(route).toMatch(/if \(!result\.success \|\| !result\.data\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\}\s*invalidateCatalogCache\(\)/)
    expect(route).toContain('ARTIST_DETAIL_CACHE_TAG')
    const catalog = source('artistas/catalogo/_actions/update-catalog.action.ts')
    expect(catalog).toMatch(/if \(!result\) return conflict\(\)[\s\S]*?\} catch \{\s*return conflict\(\)[\s\S]*?if \(intent === AVATAR_INTENT\.HISTORICAL\) \{\s*try \{\s*updateTag\(ARTIST_DETAIL_CACHE_TAG\)/)
  })

  test.each(assignmentWriters)('%s invalidates detail only after successful DB write', (file) => {
    const action = source(`${actions}/${file}`)
    expect(action).toContain('ARTIST_DETAIL_CACHE_TAG')
    const invalidation = action.includes('updateTag(ARTIST_DETAIL_CACHE_TAG)')
      ? 'updateTag(ARTIST_DETAIL_CACHE_TAG)'
      : 'ARTIST_DETAIL_CACHE_TAG\n    ]'
    expect(action).toContain(invalidation)
    expect(action.indexOf(invalidation)).toBeGreaterThan(action.indexOf('await db.'))
    expect(action.indexOf(invalidation)).toBeLessThan(action.lastIndexOf('return { success: true'))
  })

  test('event and edition mutations invalidate their existing DAL dependencies', () => {
    for (const file of ['create-event.action.ts', 'update-event.action.ts', 'delete-event.action.ts']) {
      expect(source(`eventos/_actions/${file}`)).toContain('updateTag(EVENT_CACHE_TAG)')
    }
    for (const file of ['save-edition-with-days.action.ts', 'delete-edition.action.ts']) {
      const code = source(`eventos/ediciones/_actions/${file}`)
      expect(code).toContain('updateTag(EDITION_CACHE_TAG)')
      expect(code).toContain('updateTag(EDITION_DAY_CACHE_TAG)')
    }
  })
})
