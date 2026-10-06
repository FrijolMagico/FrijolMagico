import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { activityScheduleUpdate } from '../../../../../../../src/app/(core)/eventos/participaciones/_schemas/activity.schema'

const componentPath =
  process.cwd() +
  '/src/app/(core)/eventos/participaciones/_components/update-activity-dialog.tsx'
const exhibitionPath =
  process.cwd() +
  '/src/app/(core)/eventos/participaciones/_components/update-exhibition-dialog.tsx'
const participationActionPath =
  process.cwd() +
  '/src/app/(core)/eventos/participaciones/_actions/participations/update-participation.action.ts'

const componentSource = readFileSync(componentPath, 'utf8')

describe('UpdateActivityDialog aggregate save contract', () => {
  test('submits participation, activity and detail through one aggregate action', () => {
    expect(componentSource).toContain('updateActivityAggregateAction')
    expect(componentSource).toMatch(
      /updateActivityAggregateAction\(\s*\{[\s\S]*?editionId:\s*edition\.id[\s\S]*?participation:[\s\S]*?activity:[\s\S]*?detail:[\s\S]*?\}/
    )
    expect(componentSource).not.toContain('executeUpdatePlan')
    expect(componentSource).not.toContain('updateActivityAction')
    expect(componentSource).not.toContain('createActivityDetailAction')
    expect(componentSource).not.toContain('updateActivityDetailAction')
  })

  test('omits unchanged schedule on unrelated edits and carries original snapshot for changes', () => {
    const original = [{ date: '2026-06-10', startTime: '09:00', durationMinutes: 45 }]
    const changed = [{ date: '2026-06-11', startTime: '10:00', durationMinutes: 60 }]
    expect(componentSource).toContain('...schedule,')
    expect(componentSource).toContain('activityScheduleUpdate(')
    expect(activityScheduleUpdate(original, [...original], false)).toEqual({})
    expect(activityScheduleUpdate(original, changed, false)).toEqual({
      occurrences: changed, expectedOccurrences: original
    })
    expect(activityScheduleUpdate(original, [], true)).toEqual({
      occurrences: [], expectedOccurrences: original
    })
  })

  test('keeps save feedback, form reset, and dialog close behavior', () => {
    expect(componentSource).toContain('toast.error(')
    expect(componentSource).toContain('result.errors?.map')
    expect(componentSource).toContain('toast.success(')
    expect(componentSource).toMatch(/Cambios guardados\$\{result\.webRevalidation === 'swr'/)
    expect(componentSource).toContain('methods.reset(values)')
    expect(componentSource).toContain('closeUpdateDialogs()')
    expect(componentSource).toContain('router.refresh()')
    expect(componentSource).toContain("form: 'update-activity-form'")
  })

  test('preserves the independent exhibition participation update caller', () => {
    const exhibitionSource = readFileSync(exhibitionPath, 'utf8')
    const participationActionSource = readFileSync(
      participationActionPath,
      'utf8'
    )

    expect(exhibitionSource).toContain('updateParticipationAction')
    expect(participationActionSource).toContain(
      'export async function updateParticipationAction'
    )
  })
})
