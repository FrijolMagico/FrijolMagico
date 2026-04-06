import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const CREATE_DIALOG_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/bandas/_components/band-create-dialog.tsx'
const UPDATE_DIALOG_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/bandas/_components/band-update-dialog.tsx'
const CONTAINER_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/bandas/_components/band-list-container.tsx'

function readSource(path: string) {
  return readFileSync(path, 'utf8')
}

describe('band dialog source contracts', () => {
  test('create dialog reads state from the store and renders the trigger label', () => {
    const source = readSource(CREATE_DIALOG_PATH)

    expect(source).toContain('state.isCreateBandOpen')
    expect(source).toContain('state.toggleCreateBandDialog')
    expect(source).toContain("triggerLabel='Nueva banda'")
    expect(source).toContain("toast.success('Banda creada correctamente')")
    expect(source).toContain('toggleCreateBandDialog(false)')
  })

  test('update dialog returns null without selectedBand and only closes on success', () => {
    const source = readSource(UPDATE_DIALOG_PATH)

    expect(source).toContain('if (!selectedBand) {')
    expect(source).toContain('return null')
    expect(source).toContain("toast.success('Banda actualizada correctamente')")
    expect(source).toContain('closeUpdateBandDialog()')
    expect(source).toContain("'No se pudo actualizar la banda'")
  })

  test('container uses mostrar_eliminados and the split dialogs', () => {
    const source = readSource(CONTAINER_PATH)

    expect(source).toContain(
      'const mostrar_eliminados = params.mostrar_eliminados ?? false'
    )
    expect(source).toContain('{!mostrar_eliminados && <BandCreateDialog />}')
    expect(source).toContain('<BandUpdateDialog />')
  })
})
