-- Custom SQL migration file, put your code below! --

PRAGMA foreign_keys = OFF;
--> statement-breakpoint

CREATE TABLE participacion_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edicion_id INTEGER NOT NULL,
    artista_id INTEGER,
    agrupacion_id INTEGER,
    banda_id INTEGER,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_participacion_edicion_edicion FOREIGN KEY (edicion_id)
        REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_edicion_artista FOREIGN KEY (artista_id)
        REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_edicion_agrupacion FOREIGN KEY (agrupacion_id)
        REFERENCES agrupacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_edicion_banda FOREIGN KEY (banda_id)
        REFERENCES banda (id) ON DELETE RESTRICT,
    CONSTRAINT chk_participacion_edicion_exclusive_arc CHECK (
        (artista_id IS NOT NULL) + (agrupacion_id IS NOT NULL) + (banda_id IS NOT NULL) = 1
    )
);
--> statement-breakpoint

CREATE UNIQUE INDEX uq_participacion_artista ON participacion_edicion (edicion_id, artista_id) WHERE artista_id IS NOT NULL;
--> statement-breakpoint

CREATE UNIQUE INDEX uq_participacion_agrupacion ON participacion_edicion (edicion_id, agrupacion_id) WHERE agrupacion_id IS NOT NULL;
--> statement-breakpoint

CREATE UNIQUE INDEX uq_participacion_banda ON participacion_edicion (edicion_id, banda_id) WHERE banda_id IS NOT NULL;
--> statement-breakpoint

CREATE INDEX idx_participacion_edicion_edicion ON participacion_edicion (edicion_id);
--> statement-breakpoint

CREATE INDEX idx_participacion_edicion_artista ON participacion_edicion (artista_id) WHERE artista_id IS NOT NULL;
--> statement-breakpoint

CREATE INDEX idx_participacion_edicion_agrupacion ON participacion_edicion (agrupacion_id) WHERE agrupacion_id IS NOT NULL;
--> statement-breakpoint

CREATE INDEX idx_participacion_edicion_banda ON participacion_edicion (banda_id) WHERE banda_id IS NOT NULL;
--> statement-breakpoint

CREATE TRIGGER trg_participacion_edicion_updated_at
AFTER UPDATE ON participacion_edicion
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE participacion_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
--> statement-breakpoint

-- Populate participacion_edicion from existing participation data
-- Uses UNION ALL + GROUP BY to deduplicate artists that appear in both exposicion and actividad
INSERT INTO participacion_edicion (edicion_id, artista_id, notas, created_at, updated_at)
SELECT evento_edicion_id, artista_id, NULL, MIN(created_at), MAX(updated_at)
FROM (
    SELECT artista_id, evento_edicion_id, created_at, updated_at FROM participante_exposicion
    UNION ALL
    SELECT artista_id, evento_edicion_id, created_at, updated_at FROM participante_actividad
) combined
GROUP BY evento_edicion_id, artista_id;
--> statement-breakpoint

PRAGMA foreign_keys = ON;