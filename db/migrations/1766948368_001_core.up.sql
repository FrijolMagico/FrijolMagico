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
);

CREATE TRIGGER IF NOT EXISTS trg_organizacion_updated_at
AFTER UPDATE ON organizacion
FOR EACH ROW
BEGIN
    UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

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
);

CREATE TRIGGER IF NOT EXISTS trg_organizacion_equipo_updated_at
AFTER UPDATE ON organizacion_equipo
FOR EACH ROW
BEGIN
    UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

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
);

CREATE TRIGGER IF NOT EXISTS trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- disciplina
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    created_at TEXT,
    updated_at TEXT
);

CREATE TRIGGER IF NOT EXISTS trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_disciplina_created_at
AFTER INSERT ON disciplina
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE disciplina SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- agrupacion
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    correo TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TRIGGER IF NOT EXISTS trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_agrupacion_created_at
AFTER INSERT ON agrupacion
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE agrupacion SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- tipo_actividad
CREATE TABLE IF NOT EXISTS tipo_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_tipo_actividad_nombre UNIQUE (nombre)
);

CREATE TRIGGER IF NOT EXISTS trg_tipo_actividad_updated_at
AFTER UPDATE ON tipo_actividad
FOR EACH ROW
BEGIN
    UPDATE tipo_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
