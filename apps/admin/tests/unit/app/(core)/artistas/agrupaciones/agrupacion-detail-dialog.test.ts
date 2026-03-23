import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const DETAIL_DIALOG_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/agrupaciones/_components/agrupacion-detail-dialog.tsx'

function readSource() {
  return readFileSync(DETAIL_DIALOG_PATH, 'utf8')
}

describe('agrupacion detail dialog source contracts', () => {
  test('loads dialog data when opened and resets member state when closed', () => {
    const source = readSource()

    expect(source).toContain('Promise.all([')
    expect(source).toContain('getMembersAction(agrupacionId)')
    expect(source).toContain('getAvailableArtistsAction(agrupacionId)')
    expect(source).toContain('setMembers([])')
    expect(source).toContain('setPendingMembers([])')
    expect(source).toContain('setRemovedMemberIds([])')
    expect(source).toContain('setHasMemberChanges(false)')
    expect(source).toContain('closeDetailDialog()')
  })

  test('submits agrupacion updates before syncing member mutations and closing on success', () => {
    const source = readSource()

    expect(source).toContain('const updateResult = await updateAgrupacionAction(')
    expect(source).toContain('for (const artistaId of removedMemberIds) {')
    expect(source).toContain('for (const member of members) {')
    expect(source).toContain('for (const member of pendingMembers) {')
    expect(source).toContain('await addMemberAction(')
    expect(source).toContain('await updateMemberAction(')
    expect(source).toContain('await removeMemberAction(')
    expect(source).toContain("toast.success('Agrupación actualizada correctamente')")
    expect(source).toContain('methods.reset(getDefaultValues(selectedAgrupacion))')
    expect(source).toContain('closeDetailDialog()')
  })
})
