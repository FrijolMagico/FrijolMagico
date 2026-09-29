import { Database } from 'bun:sqlite'
import { describe, expect, test } from 'bun:test'

import { CATALOG_QUERY } from './catalogoQuery'

const createCatalogFixture = () => {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE artista (id INTEGER PRIMARY KEY, nombre TEXT, pseudonimo TEXT, slug TEXT, correo TEXT, rrss TEXT, ciudad TEXT, pais TEXT);
    CREATE TABLE catalogo_artista (artista_id INTEGER, pseudonimo_id INTEGER, descripcion TEXT, orden TEXT, destacado INTEGER, activo INTEGER, deleted_at TEXT);
    CREATE TABLE artista_pseudonimo (id INTEGER PRIMARY KEY, pseudonimo TEXT);
    CREATE TABLE artista_imagen (id INTEGER PRIMARY KEY, artista_id INTEGER, imagen_url TEXT, tipo TEXT, deleted_at TEXT, created_at TEXT);
    CREATE TABLE disciplina (id INTEGER PRIMARY KEY, slug TEXT);
    CREATE TABLE tipo_actividad (id INTEGER PRIMARY KEY, slug TEXT);
    CREATE TABLE agrupacion (id INTEGER PRIMARY KEY, nombre TEXT);
    CREATE TABLE agrupacion_artista (agrupacion_id INTEGER, artista_id INTEGER, activo INTEGER);
    CREATE TABLE evento (id INTEGER PRIMARY KEY, nombre TEXT);
    CREATE TABLE evento_edicion (id INTEGER PRIMARY KEY, evento_id INTEGER, numero_edicion TEXT);
    CREATE TABLE evento_edicion_dia (evento_edicion_id INTEGER, fecha TEXT);
    CREATE TABLE participacion_edicion (id INTEGER PRIMARY KEY, edicion_id INTEGER, artista_id INTEGER, agrupacion_id INTEGER);
    CREATE TABLE participacion_exposicion (id INTEGER PRIMARY KEY, participacion_id INTEGER, disciplina_id INTEGER, estado TEXT);
    CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, participacion_id INTEGER, tipo_actividad_id INTEGER, estado TEXT);

    INSERT INTO artista VALUES
      (1, 'Ada Nombre', 'Ada Pseudónimo', 'ada', 'ada@example.test', 'ada-social', 'Montevideo', 'Uruguay'),
      (2, 'Beto Nombre', 'Beto Pseudónimo', 'beto', NULL, NULL, NULL, NULL),
      (3, 'Oculta', 'Oculta', 'oculta', NULL, NULL, NULL, NULL),
      (4, 'Borrada', 'Borrada', 'borrada', NULL, NULL, NULL, NULL);
    INSERT INTO catalogo_artista VALUES
      (1, 10, 'Bio Ada', '1', 1, 1, NULL),
      (2, NULL, NULL, '2', 0, 1, NULL),
      (3, NULL, NULL, '3', 0, 0, NULL),
      (4, NULL, NULL, '4', 0, 1, '2025-01-01');
    INSERT INTO artista_pseudonimo VALUES (10, 'Ada Catálogo');
    INSERT INTO artista_imagen VALUES (1, 1, 'https://images.example.test/ada.jpg', 'avatar', NULL, '2025-01-01');
    INSERT INTO disciplina VALUES (1, 'pintura'), (2, 'escultura'), (3, 'grabado');
    INSERT INTO tipo_actividad VALUES (1, 'charla'), (2, 'taller');
    INSERT INTO agrupacion VALUES (1, 'Colectiva Sur');
    INSERT INTO agrupacion_artista VALUES (1, 1, 1), (1, 2, 1);
    INSERT INTO evento VALUES (1, 'Festival Uno'), (2, 'Feria Dos'), (3, 'Encuentro Tres'), (4, 'Muestra Cuatro'), (5, 'Muestra Sin Fecha');
    INSERT INTO evento_edicion VALUES (1, 1, '1'), (2, 2, '2'), (3, 3, '3'), (4, 4, '4'), (5, 5, '5');
    INSERT INTO evento_edicion_dia VALUES (1, '2024-04-05'), (1, '2024-04-03'), (2, '2025-06-07'), (3, '2026-08-09');
    INSERT INTO participacion_edicion VALUES
      (1, 1, 1, NULL), (2, 2, 1, NULL), (3, 3, NULL, 1), (4, 4, 1, NULL),
      (5, 2, 2, NULL), (6, 3, 2, NULL), (7, 1, NULL, 1), (8, 5, 1, NULL);
    INSERT INTO participacion_exposicion VALUES
      (1, 1, 1, 'confirmado'), (2, 3, 2, 'completado'), (3, 4, 3, 'seleccionado'),
      (4, 5, 3, 'confirmado'), (5, 7, 1, 'confirmado'), (6, 8, 1, 'confirmado');
    INSERT INTO participacion_actividad VALUES
      (1, 2, 1, 'completado'), (2, 6, 2, 'confirmado');
  `)
  return db
}

type CatalogOutput = {
  editions: Record<string, unknown>[]
  [key: string]: unknown
}

const normalizeCatalogOutput = (serialized: string): CatalogOutput => {
  const output = JSON.parse(serialized) as CatalogOutput

  return {
    ...output,
    editions: [...output.editions].sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right))
    )
  }
}

describe('catalog SQL characterization baseline', () => {
  test('characterizes exact direct and collective catalog output on an in-memory SQLite fixture', () => {
    const db = createCatalogFixture()

    try {
      const results = db.query<{ resultado: string }, []>(CATALOG_QUERY).all()

      expect(results.map(({ resultado }) => normalizeCatalogOutput(resultado))).toEqual([
        {
          resultado:
            '{"id":1,"name":"Ada Catálogo","slug":"ada","email":"ada@example.test","rrss":"ada-social","city":"Montevideo","country":"Uruguay","bio":"Bio Ada","orden":"1","destacado":1,"avatar":"https://images.example.test/ada.jpg","category":"escultura","collective":"Colectiva Sur","editions":[{"evento_id":1,"edicion":"1","evento":"Festival Uno","año":"2024","tipo_participacion":"exhibicion","categoria":"pintura","via_agrupacion":null},{"evento_id":5,"edicion":"5","evento":"Muestra Sin Fecha","año":null,"tipo_participacion":"exhibicion","categoria":"pintura","via_agrupacion":null},{"evento_id":2,"edicion":"2","evento":"Feria Dos","año":"2025","tipo_participacion":"actividad","categoria":"charla","via_agrupacion":null},{"evento_id":1,"edicion":"1","evento":"Festival Uno","año":"2024","tipo_participacion":"exhibicion","categoria":"pintura","via_agrupacion":"Colectiva Sur"},{"evento_id":3,"edicion":"3","evento":"Encuentro Tres","año":"2026","tipo_participacion":"exhibicion","categoria":"escultura","via_agrupacion":"Colectiva Sur"}]}'
        },
        {
          resultado:
            '{"id":2,"name":"Beto Pseudónimo","slug":"beto","email":null,"rrss":null,"city":null,"country":null,"bio":null,"orden":"2","destacado":0,"avatar":null,"category":"escultura","collective":"Colectiva Sur","editions":[{"evento_id":2,"edicion":"2","evento":"Feria Dos","año":"2025","tipo_participacion":"exhibicion","categoria":"grabado","via_agrupacion":null},{"evento_id":3,"edicion":"3","evento":"Encuentro Tres","año":"2026","tipo_participacion":"actividad","categoria":"taller","via_agrupacion":null},{"evento_id":1,"edicion":"1","evento":"Festival Uno","año":"2024","tipo_participacion":"exhibicion","categoria":"pintura","via_agrupacion":"Colectiva Sur"},{"evento_id":3,"edicion":"3","evento":"Encuentro Tres","año":"2026","tipo_participacion":"exhibicion","categoria":"escultura","via_agrupacion":"Colectiva Sur"}]}'
        }
      ].map(({ resultado }) => normalizeCatalogOutput(resultado)))
    } finally {
      db.close()
    }
  })

  test('records a bounded SQLite query-plan baseline without equating VM work to Turso rows read', () => {
    const db = createCatalogFixture()

    try {
      const output = db.query<{ resultado: string }, []>(CATALOG_QUERY).all()
      const plan = db.query<{ detail: string }, []>(`EXPLAIN QUERY PLAN ${CATALOG_QUERY}`).all()
      const outputBytes = Buffer.byteLength(JSON.stringify(output))
      console.info(`catalog baseline: ${output.length} rows, ${outputBytes} JSON bytes, ${plan.length} SQLite plan rows`)

      expect(output).toHaveLength(2)
      expect(outputBytes).toBeGreaterThan(0)
      expect(plan.length).toBeGreaterThan(0)
      expect(plan.length).toBeLessThan(100)
      expect(plan.every(({ detail }) => detail.length > 0)).toBe(true)
    } finally {
      db.close()
    }
  })
})
