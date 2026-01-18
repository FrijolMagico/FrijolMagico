-- ============================================
-- Migración: 001_core
-- Descripción: Tablas base del sistema
-- Tablas: organizacion, organizacion_equipo, lugar, disciplina, agrupacion, tipo_actividad
-- ============================================

-- organizacion
CREATE TABLE IF NOT EXISTS organizacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    mision TEXT,
    vision TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

CREATE TRIGGER IF NOT EXISTS trg_organizacion_updated_at
AFTER UPDATE ON organizacion
FOR EACH ROW
BEGIN
    UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = old.id;
END
;

-- organizacion_equipo
CREATE TABLE IF NOT EXISTS organizacion_equipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    cargo TEXT,
    rrss TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_org_equipo_organizacion FOREIGN KEY (organizacion_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
)
;

CREATE INDEX IF NOT EXISTS idx_organizacion_equipo_organizacion ON organizacion_equipo (organizacion_id);

CREATE TRIGGER IF NOT EXISTS trg_organizacion_equipo_updated_at
AFTER UPDATE ON organizacion_equipo
FOR EACH ROW
BEGIN
    UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP
    WHERE id = old.id;
END
;

-- lugar
CREATE TABLE IF NOT EXISTS lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT,
    ciudad TEXT,
    coordenadas TEXT,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_lugar_nombre_direccion UNIQUE (nombre, direccion)
)
;

CREATE TRIGGER IF NOT EXISTS trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP
    WHERE id = old.id;
END
;

-- disciplina
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

CREATE TRIGGER IF NOT EXISTS trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP
    WHERE id = old.id;
END
;

-- agrupacion
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    correo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

CREATE TRIGGER IF NOT EXISTS trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = old.id;
END
;

-- tipo_actividad
-- NOTE: `tipo_actividad` definition moved to the participante migration
-- (see db/migrations/1766948371_004_participante.up.sql). Keeping a
-- placeholder comment here to indicate its intended location.
