-- =============================================================================
-- NORMALIZAR LUGARES: Extraer lugares a tabla independiente
-- =============================================================================
-- Problema: evento_edicion_dia_lugar tiene datos duplicados (nombre, direccion,
-- coordenadas) que violan 2NF. Un lugar como "Centro Cultural Santa Ines" se
-- repite 13 veces con los mismos datos.
--
-- Solucion: Crear tabla `lugar` y convertir evento_edicion_dia_lugar en tabla
-- pivote que referencia lugar_id.
-- =============================================================================

PRAGMA foreign_keys = OFF;

-- =============================================================================
-- 1. CREAR TABLA LUGAR
-- =============================================================================

CREATE TABLE lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT,
    coordenadas TEXT,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lugar_nombre_direccion UNIQUE (nombre, direccion)
);

CREATE TRIGGER trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- 2. MIGRAR LUGARES UNICOS EXISTENTES
-- =============================================================================

INSERT INTO lugar (nombre, direccion, coordenadas)
SELECT DISTINCT nombre_lugar, direccion, coordenadas
FROM evento_edicion_dia_lugar
WHERE nombre_lugar IS NOT NULL;

-- =============================================================================
-- 3. CREAR TABLA TEMPORAL CON NUEVA ESTRUCTURA
-- =============================================================================

CREATE TABLE evento_edicion_dia_lugar_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_dia_id INTEGER NOT NULL,
    lugar_id INTEGER NOT NULL,
    modalidad TEXT NOT NULL DEFAULT 'presencial' CHECK (modalidad IN ('presencial', 'online', 'hibrido')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_dia_lugar_dia FOREIGN KEY (evento_edicion_dia_id)
        REFERENCES evento_edicion_dia (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_dia_lugar_lugar FOREIGN KEY (lugar_id)
        REFERENCES lugar (id) ON DELETE RESTRICT
);

-- =============================================================================
-- 4. MIGRAR DATOS EXISTENTES
-- =============================================================================

INSERT INTO evento_edicion_dia_lugar_new (evento_edicion_dia_id, lugar_id, modalidad, created_at, updated_at)
SELECT 
    eedl.evento_edicion_dia_id,
    l.id,
    eedl.modalidad,
    eedl.created_at,
    eedl.updated_at
FROM evento_edicion_dia_lugar eedl
JOIN lugar l ON l.nombre = eedl.nombre_lugar 
    AND (l.direccion = eedl.direccion OR (l.direccion IS NULL AND eedl.direccion IS NULL));

-- =============================================================================
-- 5. REEMPLAZAR TABLA ORIGINAL
-- =============================================================================

DROP TRIGGER IF EXISTS trg_evento_edicion_dia_lugar_updated_at;
DROP TABLE evento_edicion_dia_lugar;
ALTER TABLE evento_edicion_dia_lugar_new RENAME TO evento_edicion_dia_lugar;

CREATE TRIGGER trg_evento_edicion_dia_lugar_updated_at
AFTER UPDATE ON evento_edicion_dia_lugar
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia_lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- 6. RECREAR INDICE
-- =============================================================================

CREATE INDEX idx_evento_edicion_dia_lugar_dia
ON evento_edicion_dia_lugar (evento_edicion_dia_id);

CREATE INDEX idx_evento_edicion_dia_lugar_lugar
ON evento_edicion_dia_lugar (lugar_id);

PRAGMA foreign_keys = ON;
