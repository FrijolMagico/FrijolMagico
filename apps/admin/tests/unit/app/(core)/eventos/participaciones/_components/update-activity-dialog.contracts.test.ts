import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const SRC = process.cwd() + '/src'

const DIALOG_PATH =
  SRC +
  '/app/(core)/eventos/participaciones/_components/update-activity-dialog.tsx'

describe('update activity dialog aggregate detail persistence contracts', () => {
  test('replaces per-entity detail actions with the aggregate action', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).toContain('updateActivityAggregateAction')
    expect(source).not.toContain('executeUpdatePlan')
    expect(source).not.toContain('createActivityDetailAction')
    expect(source).not.toContain('updateActivityDetailAction')
  })

  test('always submits current detail values, including when no detail row exists', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).toMatch(
      /updateActivityAggregateAction\([\s\S]*?detail:\s*\{[\s\S]*?titulo:\s*values\.detail\.titulo/
    )
    expect(source).toContain('descripcion: values.detail.descripcion')
    expect(source).toContain('duracionMinutos: values.detail.duracionMinutos')
    expect(source).toContain('cupos: values.detail.cupos')
    expect(source).toContain('horaInicio: values.detail.horaInicio')
    expect(source).toContain('ubicacion: values.detail.ubicacion')
    expect(source).not.toMatch(
      /activity\.detail\s*\?\s*updateActivityDetailAction/
    )
  })
})
