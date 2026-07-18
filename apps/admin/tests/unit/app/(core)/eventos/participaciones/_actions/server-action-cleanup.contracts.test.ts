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

    expect(createActivitySource).toContain(
      'updateTag(getEditionParticipationsCacheTag'
    )
    expect(createActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
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
