-- Custom SQL migration file, put your code below! --

-- Migración: 001_core
-- Descripción: Tablas base del sistema

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
--> statement-breakpoint

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
--> statement-breakpoint

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
--> statement-breakpoint

-- disciplina
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- TRIGGERS
-- updated_at triggers (idempotent, guarded to avoid re-updates)
DROP TRIGGER IF EXISTS trg_organizacion_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_organizacion_updated_at
AFTER UPDATE ON organizacion
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_organizacion_equipo_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_organizacion_equipo_updated_at
AFTER UPDATE ON organizacion_equipo
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_lugar_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_disciplina_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
