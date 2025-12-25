-- Actualizar evento_edicion_dia y evento_edicion_dia_lugar
-- - evento_edicion_dia: agregar hora_inicio, hora_fin
-- - evento_edicion_dia_lugar: agregar modalidad, coordenadas; hacer direccion opcional

PRAGMA foreign_keys = OFF;

-- =============================================================================
-- RECREAR evento_edicion_dia
-- =============================================================================

DROP TRIGGER IF EXISTS trg_evento_edicion_dia_updated_at;
DROP TABLE evento_edicion_dia;

CREATE TABLE evento_edicion_dia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_edicion_dia_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_evento_edicion_dia UNIQUE (evento_edicion_id, fecha)
);

CREATE TRIGGER trg_evento_edicion_dia_updated_at
AFTER UPDATE ON evento_edicion_dia
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- RECREAR evento_edicion_dia_lugar
-- =============================================================================

DROP TRIGGER IF EXISTS trg_evento_edicion_dia_lugar_updated_at;
DROP TABLE evento_edicion_dia_lugar;

CREATE TABLE evento_edicion_dia_lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_dia_id INTEGER NOT NULL,
    modalidad TEXT NOT NULL DEFAULT 'presencial' CHECK (modalidad IN ('presencial', 'online', 'hibrido')),
    nombre_lugar TEXT,
    direccion TEXT,
    coordenadas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_dia_lugar_dia FOREIGN KEY (evento_edicion_dia_id)
    REFERENCES evento_edicion_dia (id) ON DELETE CASCADE
);

CREATE TRIGGER trg_evento_edicion_dia_lugar_updated_at
AFTER UPDATE ON evento_edicion_dia_lugar
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia_lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

PRAGMA foreign_keys = ON;
