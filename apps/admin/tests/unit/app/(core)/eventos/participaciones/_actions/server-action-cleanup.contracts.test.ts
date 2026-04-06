import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const HELPER_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/_lib/find-or-create-edition-participation.ts'
const ADD_ACTIVITY_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/activities/add-activity.action.ts'
const ADD_EXHIBITION_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/exhibitions/add-exhibition.action.ts'
const UPDATE_EXHIBITION_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/update-exhibition.action.ts'
const DELETE_EXHIBITION_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/exhibitions/delete-exhibition.action.ts'
const UPDATE_ACTIVITY_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/update-activity.action.ts'
const DELETE_ACTIVITY_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/activities/delete-activity.action.ts'
const UPDATE_DETAILS_ACTION_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_actions/update-activity-details.action.ts'

describe('participation server action cleanup contracts', () => {
  test('shared helper remains server-only and enforces a single participant entity', () => {
    const helperSource = readFileSync(HELPER_PATH, 'utf8')

    expect(helperSource).toContain("import 'server-only'")
    expect(helperSource).toContain('ExtractTablesWithRelations')
    expect(helperSource).toContain('LibSQLTransaction')
    expect(helperSource).toContain(
      'findOrCreateEditionParticipation requires exactly one participant entity'
    )
    expect(helperSource).toContain('tx.query.editionParticipation.findFirst')
    expect(helperSource).toContain('.insert(editionParticipation)')
  })

  test('add actions delegate participation lookup/creation to the shared helper', () => {
    const addActivitySource = readFileSync(ADD_ACTIVITY_ACTION_PATH, 'utf8')
    const addExhibitionSource = readFileSync(ADD_EXHIBITION_ACTION_PATH, 'utf8')

    expect(addActivitySource).toContain(
      "import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'"
    )
    expect(addActivitySource).toContain(
      'await findOrCreateEditionParticipation(tx, {'
    )
    expect(addActivitySource).not.toContain('let participationRecord = null')

    expect(addExhibitionSource).toContain(
      "import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'"
    )
    expect(addExhibitionSource).toContain(
      'await findOrCreateEditionParticipation(tx, {'
    )
    expect(addExhibitionSource).not.toContain('let participationRecord = null')
  })

  test('mutation actions invalidate scoped cache tags alongside broad migration tags', () => {
    const addActivitySource = readFileSync(ADD_ACTIVITY_ACTION_PATH, 'utf8')
    const addExhibitionSource = readFileSync(ADD_EXHIBITION_ACTION_PATH, 'utf8')
    const updateExhibitionSource = readFileSync(
      UPDATE_EXHIBITION_ACTION_PATH,
      'utf8'
    )
    const deleteExhibitionSource = readFileSync(
      DELETE_EXHIBITION_ACTION_PATH,
      'utf8'
    )
    const updateActivitySource = readFileSync(
      UPDATE_ACTIVITY_ACTION_PATH,
      'utf8'
    )
    const deleteActivitySource = readFileSync(
      DELETE_ACTIVITY_ACTION_PATH,
      'utf8'
    )
    const updateDetailsSource = readFileSync(UPDATE_DETAILS_ACTION_PATH, 'utf8')

    expect(addExhibitionSource).toContain(
      'updateTag(getEditionParticipationsCacheTag(edicionId))'
    )
    expect(addExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag(participationId))'
    )
    expect(updateExhibitionSource).toContain(
      'updateTag(getEditionParticipationsCacheTag(edicionId))'
    )
    expect(updateExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag(participationId))'
    )
    expect(deleteExhibitionSource).toContain(
      'updateTag(getEditionParticipationsCacheTag(editionId))'
    )
    expect(deleteExhibitionSource).toContain(
      'updateTag(getParticipationExhibitionsCacheTag(participationId))'
    )

    expect(addActivitySource).toContain(
      'updateTag(getEditionParticipationsCacheTag(edicionId))'
    )
    expect(addActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
    expect(updateActivitySource).toContain(
      'updateTag(getEditionParticipationsCacheTag(edicionId))'
    )
    expect(updateActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
    expect(deleteActivitySource).toContain(
      'updateTag(getEditionParticipationsCacheTag(editionId))'
    )
    expect(deleteActivitySource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
    expect(updateDetailsSource).toContain(
      'updateTag(getParticipationActivitiesCacheTag(participationId))'
    )
  })

  test('updateExhibitionAction validates edition ownership before writing', () => {
    const updateExhibitionSource = readFileSync(
      UPDATE_EXHIBITION_ACTION_PATH,
      'utf8'
    )

    expect(updateExhibitionSource).toContain(
      'const { id: expositorId, edicionId'
    )
    expect(updateExhibitionSource).toContain(
      'tx.query.participationExhibition.findFirst'
    )
    expect(updateExhibitionSource).toContain('participacion: {')
    expect(updateExhibitionSource).toContain(
      'exhibitionRecord.participacion.edicionId !== edicionId'
    )
    expect(updateExhibitionSource).toContain(
      "throw new Error('Exhibitor not found for the requested edition')"
    )
  })
})
