import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

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

  test('keeps save feedback, form reset, and dialog close behavior', () => {
    expect(componentSource).toContain('toast.error(')
    expect(componentSource).toContain('result.errors?.map')
    expect(componentSource).toContain("toast.success('Cambios guardados')")
    expect(componentSource).toContain('methods.reset(values)')
    expect(componentSource).toContain('closeUpdateDialogs()')
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
