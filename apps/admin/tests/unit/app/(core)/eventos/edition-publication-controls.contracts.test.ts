import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const EVENTOS_DIR = join(
  import.meta.dir,
  '../../../../../src/app/(core)/eventos'
)
const PUBLICATION_SWITCH_PATH = join(
  EVENTOS_DIR,
  '_components/edition-publication-switch.tsx'
)
const EDITION_ROW_PATH = join(
  EVENTOS_DIR,
  'ediciones/_components/edition-row.tsx'
)
const PARTICIPATIONS_SELECTOR_PATH = join(
  EVENTOS_DIR,
  'participaciones/_components/participations-edition-selector.tsx'
)
const EDITIONS_DAL_PATH = join(
  EVENTOS_DIR,
  'ediciones/_lib/data-access-layer/get-editions.ts'
)
const EDITIONS_LOOKUP_PATH = join(
  EVENTOS_DIR,
  'participaciones/_lib/data-access-layer/get-editions-lookup.ts'
)
const EDITION_SAVE_PATH = join(
  EVENTOS_DIR,
  'ediciones/_actions/save-edition-with-days.action.ts'
)

describe('edition publication controls contracts', () => {
  test('uses one optimistic publication control that reports failed changes', () => {
    const source = readFileSync(PUBLICATION_SWITCH_PATH, 'utf8')

    expect(source).toContain('useOptimistic')
    expect(source).toContain('updateEditionPublicationAction')
    expect(source).toContain("toast.error('No se pudo actualizar la publicación')")
    expect(source).toContain('disabled={isPending}')
  })

  test('renders the same publication control in edition rows and beside the participation selector', () => {
    const editionRowSource = readFileSync(EDITION_ROW_PATH, 'utf8')
    const selectorSource = readFileSync(PARTICIPATIONS_SELECTOR_PATH, 'utf8')

    expect(editionRowSource).toContain('EditionPublicationSwitch')
    expect(selectorSource).toContain('EditionPublicationSwitch')
  })

  test('keeps unpublished editions in both admin data sources and preserves publication on ordinary edits', () => {
    const editionsDalSource = readFileSync(EDITIONS_DAL_PATH, 'utf8')
    const editionsLookupSource = readFileSync(EDITIONS_LOOKUP_PATH, 'utf8')
    const editionSaveSource = readFileSync(EDITION_SAVE_PATH, 'utf8')

    expect(editionsDalSource).toContain('published: eventEdition.published')
    expect(editionsLookupSource).toContain('published: eventEdition.published')
    expect(editionsDalSource).not.toContain('eventEdition.published, true')
    expect(editionSaveSource).not.toContain('published:')
  })
})
