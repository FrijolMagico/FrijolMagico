import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const DIALOG_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_components/update-activity-dialog.tsx'

describe('update activity dialog detail persistence contracts', () => {
  test('imports the create detail action alongside the update action', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).toContain(
      "import { createActivityDetailAction } from '../_actions/activities/create-activity-detail.action'"
    )
    expect(source).toContain(
      "import { updateActivityDetailAction } from '../_actions/activities/update-activity-detail.action'"
    )
  })

  test('always includes a detail step instead of conditionally spreading it', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).not.toContain('...(activity.detail')
    expect(source).toContain("label: 'el detalle de actividad'")
    expect(source).toContain('createActivityDetailAction')
    expect(source).toContain('updateActivityDetailAction')
  })

  test('branches detail execution on activity.detail presence', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).toMatch(/activity\.detail\s*\?\s*updateActivityDetailAction/)
    expect(source).toMatch(/:\s*createActivityDetailAction/)
  })

  test('provides default empty detail diff when no detail exists', () => {
    const source = readFileSync(DIALOG_PATH, 'utf8')

    expect(source).toContain('participacionActividadId: activity.id')
    expect(source).toContain("titulo: ''")
    expect(source).toContain("descripcion: ''")
    expect(source).toContain('duracionMinutos: null')
    expect(source).toContain('cupos: null')
    expect(source).toContain("horaInicio: ''")
    expect(source).toContain("ubicacion: ''")
  })
})
