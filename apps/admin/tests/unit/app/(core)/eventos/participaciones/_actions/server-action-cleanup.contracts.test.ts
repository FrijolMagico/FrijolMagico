import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const SRC = process.cwd() + '/src'

const ACTIONS_DIR = SRC + '/app/(core)/eventos/participaciones/_actions'

const HELPER_PATH = `${ACTIONS_DIR}/_lib/find-or-create-edition-participation.ts`
const CREATE_ACTIVITY_PATH = `${ACTIONS_DIR}/activities/create-activity.action.ts`
const CREATE_EXHIBITION_PATH = `${ACTIONS_DIR}/exhibitions/create-exhibition.action.ts`
const UPDATE_EXHIBITION_PATH = `${ACTIONS_DIR}/exhibitions/update-exhibition.action.ts`
const DELETE_EXHIBITION_PATH = `${ACTIONS_DIR}/exhibitions/delete-exhibition.action.ts`
const UPDATE_ACTIVITY_PATH = `${ACTIONS_DIR}/activities/update-activity.action.ts`
const DELETE_ACTIVITY_PATH = `${ACTIONS_DIR}/activities/delete-activity.action.ts`
const UPDATE_DETAILS_PATH = `${ACTIONS_DIR}/activities/update-activity-detail.action.ts`
const UPDATE_PARTICIPATION_PATH = `${ACTIONS_DIR}/participations/update-participation.action.ts`
const UPDATE_ACTIVITY_AGGREGATE_PATH = `${ACTIONS_DIR}/activities/update-activity-aggregate.action.ts`

describe('participation server action cleanup contracts', () => {
  test('shared helper remains server-only and enforces a single participant entity', () => {
    const helperSource = readFileSync(HELPER_PATH, 'utf8')

    expect(helperSource).toContain("import 'server-only'")
    expect(helperSource).toContain('Transaction')
    expect(helperSource).toContain(
      'findOrCreateEditionParticipation requires exactly one participant entity'
    )
    expect(helperSource).toContain('tx.query.editionParticipation.findFirst')
    expect(helperSource).toContain('.insert(editionParticipation)')
  })

  test('create actions delegate participation lookup/creation to the shared helper', () => {
    const createActivitySource = readFileSync(CREATE_ACTIVITY_PATH, 'utf8')
    const createExhibitionSource = readFileSync(CREATE_EXHIBITION_PATH, 'utf8')

    expect(createActivitySource).toContain(
      "import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'"
    )
    expect(createActivitySource).toContain('findOrCreateEditionParticipation')
    expect(createActivitySource).not.toContain('let participationRecord = null')

    expect(createExhibitionSource).toContain(
      "import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'"
    )
    expect(createExhibitionSource).toContain('findOrCreateEditionParticipation')
    expect(createExhibitionSource).not.toContain(
      'let participationRecord = null'
    )
  })

  test('mutation actions invalidate scoped cache tags alongside broad migration tags', () => {
    const createActivitySource = readFileSync(CREATE_ACTIVITY_PATH, 'utf8')
    const createExhibitionSource = readFileSync(CREATE_EXHIBITION_PATH, 'utf8')
    const updateExhibitionSource = readFileSync(UPDATE_EXHIBITION_PATH, 'utf8')
    const deleteExhibitionSource = readFileSync(DELETE_EXHIBITION_PATH, 'utf8')
    const updateActivitySource = readFileSync(UPDATE_ACTIVITY_PATH, 'utf8')
    const deleteActivitySource = readFileSync(DELETE_ACTIVITY_PATH, 'utf8')
    const updateDetailsSource = readFileSync(UPDATE_DETAILS_PATH, 'utf8')

    expect(createExhibitionSource).toContain(
      'updateTag(getEditionParticipationsCacheTag'
    )
    expect(createExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag(participationId))'
    )
    expect(updateExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag'
    )
    expect(deleteExhibitionSource).toContain(
      'updateTag(getEditionParticipationsCacheTag'
    )
    expect(deleteExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag(participationId))'
    )

    expect(createActivitySource).toContain('getEditionParticipationsCacheTag')
    expect(createActivitySource).toContain(
      'getParticipationActivitiesCacheTag(participationId)'
    )
    expect(createActivitySource).toContain('...PUBLIC_ACTIVITY_TAGS')
    expect(createActivitySource).toContain('revalidateWebCacheBatch')
    expect(updateActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag'
    )
    expect(deleteActivitySource).toContain(
      'updateTag(getEditionParticipationsCacheTag'
    )
    expect(deleteActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
    expect(updateDetailsSource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
  })

  test('catalog invalidation is conditional on public catalog mutations', () => {
    const createExhibitionSource = readFileSync(CREATE_EXHIBITION_PATH, 'utf8')
    const updateExhibitionSource = readFileSync(UPDATE_EXHIBITION_PATH, 'utf8')
    const deleteExhibitionSource = readFileSync(DELETE_EXHIBITION_PATH, 'utf8')
    const updateParticipationSource = readFileSync(UPDATE_PARTICIPATION_PATH, 'utf8')
    const updateActivityAggregateSource = readFileSync(
      UPDATE_ACTIVITY_AGGREGATE_PATH,
      'utf8'
    )

    for (const source of [
      createExhibitionSource,
      updateExhibitionSource,
      deleteExhibitionSource,
      updateParticipationSource,
      updateActivityAggregateSource
    ]) {
      expect(source).toContain('CATALOG_CACHE_TAG')
      expect(source).toContain('catalogChanged')
    }
    expect(updateParticipationSource).toContain('revalidateWebCacheBatch')
    expect(updateActivityAggregateSource).toContain('revalidateWebCacheBatch')
    for (const source of [
      createExhibitionSource,
      updateExhibitionSource,
      deleteExhibitionSource
    ]) {
      expect(source).toContain('revalidateWebCacheBatch')
      expect(source).toMatch(/\.\.\.\(catalogChanged\s*\?/)
      expect(source).toContain('tag: CATALOG_CACHE_TAG')
      expect(source).toContain('tag: CATALOG_PARTICIPATION_CACHE_TAG')
      expect(source).not.toContain('/catalogo')
    }
    expect(deleteExhibitionSource).toContain('if (alreadyAbsent)')
    expect(updateParticipationSource).toContain('existing.artistaId !== parsed.data.artistaId')
    expect(updateExhibitionSource).toContain('existing.artistaId !== (artistId ?? null)')
    expect(updateExhibitionSource).toContain('existing.pseudonimoId !== pseudonimoId')
    expect(updateActivityAggregateSource).toContain("['confirmado', 'completado']")
  })

  test('participation-domain catalog invalidation wires only the participation tag', () => {
    const deleteActivityPath = `${ACTIONS_DIR}/activities/delete-activity.action.ts`
    const actionPaths = [
      CREATE_ACTIVITY_PATH,
      deleteActivityPath,
      UPDATE_ACTIVITY_PATH,
      UPDATE_ACTIVITY_AGGREGATE_PATH,
      CREATE_EXHIBITION_PATH,
      DELETE_EXHIBITION_PATH,
      UPDATE_EXHIBITION_PATH,
      UPDATE_PARTICIPATION_PATH
    ]
    const batchMigratedPaths = new Set([
      CREATE_ACTIVITY_PATH,
      deleteActivityPath,
      UPDATE_ACTIVITY_PATH,
      UPDATE_ACTIVITY_AGGREGATE_PATH,
      UPDATE_PARTICIPATION_PATH
    ])

    for (const path of actionPaths) {
      const source = readFileSync(path, 'utf8')
      expect(source).toContain('CATALOG_CACHE_TAG')
      expect(source).toContain('CATALOG_PARTICIPATION_CACHE_TAG')
      expect(source).not.toContain('/catalogo')
      expect(source).toContain('tag: CATALOG_PARTICIPATION_CACHE_TAG')
      expect(source).toContain('tag: CATALOG_CACHE_TAG')
      if (path === CREATE_ACTIVITY_PATH) {
        expect(source).toContain(
          'webInvalidationRequests.push({ tag: CATALOG_PARTICIPATION_CACHE_TAG })'
        )
        expect(source).toMatch(/if \(isPublicActivity\)\s*\{[\s\S]*?webInvalidationRequests\.push\(\{ tag: CATALOG_CACHE_TAG \}\)/)
        expect(source).toContain('await revalidateWebCacheBatch')
      } else if (path === deleteActivityPath) {
        expect(source).toMatch(/if \(isPublicActivity\)\s*\{[\s\S]*?webRevalidationRequests\.push\([\s\S]*?tag: CATALOG_CACHE_TAG[\s\S]*?tag: CATALOG_PARTICIPATION_CACHE_TAG/)
        expect(source).toContain('revalidateWebCacheBatch')
      } else if (path === UPDATE_PARTICIPATION_PATH) {
        expect(source).toMatch(/if \(catalogChanged\)\s*\{[\s\S]*?webRevalidationRequests\.push\([\s\S]*?tag: CATALOG_CACHE_TAG[\s\S]*?tag: CATALOG_PARTICIPATION_CACHE_TAG/)
        expect(source).toContain('revalidateWebCacheBatch')
      } else if (
        path === UPDATE_ACTIVITY_PATH ||
        path === UPDATE_ACTIVITY_AGGREGATE_PATH
      ) {
        expect(source).toMatch(/\.\.\.\(catalogChanged\s*\?/)
        expect(source).toContain('revalidateWebCacheBatch')
      } else if (batchMigratedPaths.has(path)) {
        expect(source).toContain('revalidateWebCacheBatch')
      } else {
        expect(source).toMatch(/\.\.\.\(catalogChanged\s*\?/)
        expect(source).toContain('revalidateWebCacheBatch')
      }
      expect(source).not.toContain('CATALOG_BASE_CACHE_TAG')
      expect(source).not.toContain('CATALOG_EDITION_DATES_CACHE_TAG')
    }
  })

  test('updateExhibitionAction updates exhibition fields', () => {
    const updateExhibitionSource = readFileSync(UPDATE_EXHIBITION_PATH, 'utf8')

    expect(updateExhibitionSource).toContain('updateExhibitionAction')
    expect(updateExhibitionSource).toContain('ExhibitionUpdateInput')
    expect(updateExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag'
    )
    expect(updateExhibitionSource).toContain('exhibitionUpdateSchema')
  })
})
