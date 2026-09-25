-- Custom SQL migration file, put your code below! --

ALTER TABLE agrupacion ADD COLUMN activo INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint

CREATE TABLE band (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    email TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    phone TEXT,
    city TEXT,
    country TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_band_active CHECK (active IN (0, 1))
);
--> statement-breakpoint

CREATE TRIGGER trg_banda_updated_at
AFTER UPDATE ON band
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE band SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
--> statement-breakpoint

CREATE TABLE agrupacion_artista (
    agrupacion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    rol TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agrupacion_id, artista_id),
    CONSTRAINT fk_agrupacion_artista_agrupacion FOREIGN KEY (agrupacion_id)
        REFERENCES agrupacion (id) ON DELETE CASCADE,
    CONSTRAINT fk_agrupacion_artista_artista FOREIGN KEY (artista_id)
        REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT chk_agrupacion_artista_activo CHECK (activo IN (0, 1))
);
--> statement-breakpoint

CREATE INDEX idx_agrupacion_artista_artista ON agrupacion_artista (artista_id);
--> statement-breakpoint

CREATE INDEX idx_agrupacion_artista_activo ON agrupacion_artista (agrupacion_id) WHERE activo = 1;