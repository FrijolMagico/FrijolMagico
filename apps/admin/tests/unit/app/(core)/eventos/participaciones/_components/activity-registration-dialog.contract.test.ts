import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const root = process.cwd() + '/src/app/(core)/eventos/participaciones/'
const source = (path: string) => readFileSync(root + path, 'utf8')

const dal = source('_lib/data-access-layer/get-activities-with-details.ts')
const composer = source('_lib/participation-composer.ts')
const create = source('_components/create-activity-dialog.tsx')
const update = source('_components/update-activity-dialog.tsx')

describe('admin registration read and dialog contract', () => {
  test('left joins optional registration and converts stored UTC defaults in the server DAL', () => {
    expect(dal).toContain('leftJoin(')
    expect(dal).toContain('activityRegistration')
    expect(dal).toContain(
      'eq(activityRegistration.participationActivityId, participationActivity.id)'
    )
    expect(dal).toContain('utcToChileLocal')
    expect(dal).toContain('row.registrationId === null')
    expect(composer).toContain('registration: activity.registration')
  })

  test('both dialogs bind complete registration fields and submit to authoritative actions', () => {
    const fields = source('_components/activity-registration-fields.tsx')
    for (const name of [
      'url',
      'startDate',
      'startTime',
      'endDate',
      'endTime'
    ]) {
      expect(fields).toContain(`${name}: ''`)
    }
    expect(fields).toContain('methods.register(name)')
    expect(fields).toContain("methods.register('registration.url')")
    for (const dialog of [create, update]) {
      expect(dialog).toContain('EMPTY_REGISTRATION')
      expect(dialog).toContain('<ActivityRegistrationFields')
      expect(dialog).toContain('registration: values.registration')
      expect(dialog).toContain('clearRegistration(')
      expect(dialog).toContain('router.refresh()')
    }
    expect(update).toContain('activity?.registration ?? EMPTY_REGISTRATION')
    expect(create).toContain('createActivityAction')
    expect(update).toContain('updateActivityAggregateAction')
  })

  test('music clearing is based on selected type or band, not trusted by the server action', () => {
    for (const dialog of [create, update]) {
      expect(dialog).toContain('ACTIVITY_TYPES.MUSICA')
      expect(dialog).toContain('clearRegistration(methods)')
    }
    const action = source(
      '_actions/activities/update-activity-aggregate.action.ts'
    )
    expect(action).toContain('parseActivityRegistrationInput(')
    expect(action).toContain('effectiveType.slug')
  })
})
