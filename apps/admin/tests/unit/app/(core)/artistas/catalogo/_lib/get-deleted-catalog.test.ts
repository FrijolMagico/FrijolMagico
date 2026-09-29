import { beforeEach, describe, expect, mock, test } from 'bun:test'

let resultSets: unknown[][] = []
let selectCount = 0

function createQueryBuilder() {
  const builder = {
    from: () => builder,
    innerJoin: () => builder,
    where: () => builder,
    orderBy: () => builder,
    limit: () => builder,
    then: (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown
    ) => {
      selectCount += 1
      const result = resultSets.shift() ?? []
      return Promise.resolve(result).then(resolve, reject)
    }
  }
  return builder
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag: () => {} }))
mock.module('@frijolmagico/database/orm', () => ({
  db: { select: () => createQueryBuilder() }
}))

const { getDeletedCatalog } = await import(
  '@/core/artistas/catalogo/_lib/get-deleted-catalog'
)

describe('getDeletedCatalog pseudonym projection', () => {
  beforeEach(() => {
    selectCount = 0
  })

  test('includes active pseudonyms so deleted catalog rows retain their contextual name', async () => {
    resultSets = [
      [
        {
          id: 12,
          pseudonimoId: 92,
          artistaId: 9,
          orden: 'a0',
          destacado: false,
          activo: false,
          descripcion: null,
          deletedAt: '2026-04-01',
          artist: {
            id: 9,
            pseudonimo: 'Primary name',
            nombre: null,
            rut: null,
            telefono: null,
            correo: null,
            ciudad: null,
            pais: null,
            estadoId: 1,
            rrss: null,
            slug: 'primary-name'
          }
        }
      ],
      [],
      [
        { id: 91, artistaId: 9, pseudonimo: 'Primary name' },
        { id: 92, artistaId: 9, pseudonimo: 'Catalog context' }
      ]
    ]

    const result = await getDeletedCatalog()

    expect(result[0]?.artist.activePseudonyms).toEqual([
      { id: 91, pseudonimo: 'Primary name' },
      { id: 92, pseudonimo: 'Catalog context' }
    ])
    expect(
      result[0]?.artist.activePseudonyms?.find(
        (pseudonym) => pseudonym.id === result[0]?.pseudonimoId
      )?.pseudonimo
    ).toBe('Catalog context')
    expect(selectCount).toBe(3)
  })

  test('does not query avatars or pseudonyms when there are no deleted entries', async () => {
    resultSets = [[]]

    await expect(getDeletedCatalog()).resolves.toEqual([])
    expect(selectCount).toBe(1)
  })
})
