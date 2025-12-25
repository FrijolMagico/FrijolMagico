-- Hacer campo nombre opcional en evento_edicion
-- SQLite requiere recrear la tabla para modificar constraints

PRAGMA foreign_keys = OFF;

DROP TRIGGER IF EXISTS trg_evento_edicion_updated_at;
DROP INDEX IF EXISTS idx_evento_edicion_numero;
DROP TABLE evento_edicion;

CREATE TABLE evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    nombre TEXT,
    numero_edicion TEXT NOT NULL,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (evento_id)
    REFERENCES evento (id) ON DELETE CASCADE
);

CREATE TRIGGER trg_evento_edicion_updated_at
AFTER UPDATE ON evento_edicion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE UNIQUE INDEX idx_evento_edicion_numero 
ON evento_edicion (numero_edicion);

PRAGMA foreign_keys = ON;
