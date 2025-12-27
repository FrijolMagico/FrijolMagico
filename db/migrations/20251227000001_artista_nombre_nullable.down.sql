-- Rollback: Revertir nombre a NOT NULL y pseudonimo a nullable
-- IMPORTANTE: Preserva datos de tablas dependientes

PRAGMA foreign_keys=OFF;

-- 1. Crear tablas temporales para guardar datos de tablas dependientes
CREATE TABLE IF NOT EXISTS _temp_evento_edicion_participante AS SELECT * FROM evento_edicion_participante;
CREATE TABLE IF NOT EXISTS _temp_artista_imagen AS SELECT * FROM artista_imagen;
CREATE TABLE IF NOT EXISTS _temp_artista_historial AS SELECT * FROM artista_historial;
CREATE TABLE IF NOT EXISTS _temp_agrupacion_miembro AS SELECT * FROM agrupacion_miembro;

-- 2. Vaciar tablas dependientes
DELETE FROM evento_edicion_participante;
DELETE FROM artista_imagen;
DELETE FROM artista_historial;
DELETE FROM agrupacion_miembro;

-- 3. Crear nueva tabla con schema original
CREATE TABLE artista_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    descripcion TEXT,
    pais TEXT,
    created_at TEXT,
    updated_at TEXT,
    slug TEXT
);

-- 4. Copiar datos (restaurar nombre = pseudonimo donde era NULL)
INSERT INTO artista_new (id, nombre, pseudonimo, correo, rrss, ciudad, descripcion, pais, created_at, updated_at, slug)
SELECT 
    id,
    COALESCE(nombre, pseudonimo),
    pseudonimo,
    correo, rrss, ciudad, descripcion, pais, created_at, updated_at, slug
FROM artista;

-- 5. Eliminar y renombrar
DROP TABLE artista;
ALTER TABLE artista_new RENAME TO artista;

-- 6. Recrear índice
CREATE UNIQUE INDEX idx_artista_slug ON artista(slug);

-- 7. Restaurar datos de tablas dependientes
INSERT INTO evento_edicion_participante SELECT * FROM _temp_evento_edicion_participante;
INSERT INTO artista_imagen SELECT * FROM _temp_artista_imagen;
INSERT INTO artista_historial SELECT * FROM _temp_artista_historial;
INSERT INTO agrupacion_miembro SELECT * FROM _temp_agrupacion_miembro;

-- 8. Limpiar tablas temporales
DROP TABLE _temp_evento_edicion_participante;
DROP TABLE _temp_artista_imagen;
DROP TABLE _temp_artista_historial;
DROP TABLE _temp_agrupacion_miembro;

PRAGMA foreign_keys=ON;
