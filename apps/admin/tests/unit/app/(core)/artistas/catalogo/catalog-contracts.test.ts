import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const PAGE_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/catalogo/page.tsx'
const TABLE_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/catalogo/_components/catalog-table.tsx'
const ROW_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/artistas/catalogo/_components/catalog-row.tsx'

describe('catalog source contracts', () => {
  test('page loads eligible artists from catalog DAL instead of getAllArtists', () => {
    const source = readFileSync(PAGE_PATH, 'utf8')

    expect(source).toContain('getArtistsNotInCatalog')
    expect(source).not.toContain('getAllArtists')
    expect(source).toContain('availableArtists={availableArtists}')
  })

  test('table and row render from catalog.artist instead of artist lookups', () => {
    const tableSource = readFileSync(TABLE_PATH, 'utf8')
    const rowSource = readFileSync(ROW_PATH, 'utf8')

    expect(tableSource).not.toContain('artists.find')
    expect(tableSource).toContain('key={item.id}')
    expect(tableSource).toContain('catalog={item}')
    expect(tableSource).toContain('sortable={canReorder}')
    expect(tableSource).toContain('onDelete={handleCatalogItemDelete}')
    expect(rowSource).toContain('const artist = catalog.artist')
    expect(rowSource).toContain(
      'openUpdateCatalogDialog(catalog, catalog.artist)'
    )
  })
})
