-- Custom SQL migration file, put your code below! --

PRAGMA foreign_keys = OFF;
--> statement-breakpoint

CREATE TABLE participacion_exposicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participacion_id INTEGER NOT NULL UNIQUE,
    disciplina_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 1,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pexp_participacion FOREIGN KEY (participacion_id)
        REFERENCES participacion_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_pexp_disciplina FOREIGN KEY (disciplina_id)
        REFERENCES disciplina (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pexp_postulacion FOREIGN KEY (postulacion_id)
        REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pexp_modo_ingreso FOREIGN KEY (modo_ingreso_id)
        REFERENCES modo_ingreso (id) ON DELETE RESTRICT,
    CONSTRAINT chk_pexp_estado CHECK (estado IN (
        'seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'
    ))
);
--> statement-breakpoint

CREATE INDEX idx_pexp_participacion ON participacion_exposicion (participacion_id);
--> statement-breakpoint

CREATE INDEX idx_pexp_disciplina ON participacion_exposicion (disciplina_id);
--> statement-breakpoint

CREATE INDEX idx_pexp_estado ON participacion_exposicion (estado);
--> statement-breakpoint

CREATE TABLE participacion_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participacion_id INTEGER NOT NULL,
    tipo_actividad_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 2,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _legacy_participante_actividad_id INTEGER,

    CONSTRAINT fk_pact_participacion FOREIGN KEY (participacion_id)
        REFERENCES participacion_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_pact_tipo_actividad FOREIGN KEY (tipo_actividad_id)
        REFERENCES tipo_actividad (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pact_postulacion FOREIGN KEY (postulacion_id)
        REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pact_modo_ingreso FOREIGN KEY (modo_ingreso_id)
        REFERENCES modo_ingreso (id) ON DELETE RESTRICT,
    CONSTRAINT chk_pact_estado CHECK (estado IN (
        'seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'
    ))
);
--> statement-breakpoint

CREATE INDEX idx_pact_participacion ON participacion_actividad (participacion_id);
--> statement-breakpoint

CREATE INDEX idx_pact_tipo_actividad ON participacion_actividad (tipo_actividad_id);
--> statement-breakpoint

CREATE INDEX idx_pact_estado ON participacion_actividad (estado);
--> statement-breakpoint

INSERT INTO participacion_exposicion
    (participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
SELECT
    pe_new.id,
    old.disciplina_id,
    old.postulacion_id,
    old.modo_ingreso_id,
    old.puntaje,
    old.estado,
    old.notas,
    old.created_at,
    old.updated_at
FROM participante_exposicion old
JOIN participacion_edicion pe_new
    ON pe_new.edicion_id = old.evento_edicion_id
   AND pe_new.artista_id = old.artista_id;
--> statement-breakpoint

INSERT INTO participacion_actividad
    (participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at, _legacy_participante_actividad_id)
SELECT
    pe_new.id,
    old.tipo_actividad_id,
    old.postulacion_id,
    old.modo_ingreso_id,
    old.puntaje,
    old.estado,
    old.notas,
    old.created_at,
    old.updated_at,
    old.id
FROM participante_actividad old
JOIN participacion_edicion pe_new
    ON pe_new.edicion_id = old.evento_edicion_id
   AND pe_new.artista_id = old.artista_id;
--> statement-breakpoint

CREATE TABLE actividad_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participacion_actividad_id INTEGER NOT NULL UNIQUE,
    titulo TEXT,
    descripcion TEXT,
    duracion_minutos INTEGER,
    hora_inicio TEXT,
    ubicacion TEXT,
    cupos INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_participacion_actividad FOREIGN KEY (participacion_actividad_id)
        REFERENCES participacion_actividad (id) ON DELETE CASCADE
);
--> statement-breakpoint

INSERT INTO actividad_new
    (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
SELECT
    a_old.id,
    pa_new.id,
    a_old.titulo,
    a_old.descripcion,
    a_old.duracion_minutos,
    a_old.hora_inicio,
    a_old.ubicacion,
    a_old.cupos,
    a_old.created_at,
    a_old.updated_at
FROM actividad a_old
JOIN participacion_actividad pa_new
    ON pa_new._legacy_participante_actividad_id = a_old.participante_actividad_id;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_cascade_cancel_to_exposicion;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_evento_edicion_participante_updated_at;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_participante_exposicion_updated_at;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_participante_actividad_updated_at;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_prevent_vetado_exposicion;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_prevent_vetado_actividad;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_cancel_all_on_veto;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_actividad_updated_at;
--> statement-breakpoint

DROP TABLE actividad;
--> statement-breakpoint

DROP TABLE participante_exposicion;
--> statement-breakpoint

DROP TABLE participante_actividad;
--> statement-breakpoint

DROP TABLE evento_edicion_participante;
--> statement-breakpoint

ALTER TABLE actividad_new RENAME TO actividad;
--> statement-breakpoint

ALTER TABLE participacion_actividad DROP COLUMN _legacy_participante_actividad_id;
--> statement-breakpoint

CREATE INDEX idx_actividad_participacion_actividad ON actividad (participacion_actividad_id);
--> statement-breakpoint

CREATE TRIGGER trg_actividad_updated_at
AFTER UPDATE ON actividad
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
--> statement-breakpoint

CREATE TRIGGER trg_participacion_exposicion_updated_at
AFTER UPDATE ON participacion_exposicion
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE participacion_exposicion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
--> statement-breakpoint

CREATE TRIGGER trg_participacion_actividad_updated_at
AFTER UPDATE ON participacion_actividad
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE participacion_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
--> statement-breakpoint

CREATE TRIGGER trg_prevent_vetado_exposicion
BEFORE INSERT ON participacion_exposicion
FOR EACH ROW
WHEN (NEW.estado IS NULL OR NEW.estado != 'completado')
AND (
    SELECT a.estado_id FROM artista a
    JOIN participacion_edicion pe ON pe.artista_id = a.id
    WHERE pe.id = NEW.participacion_id
) = 4
BEGIN
    SELECT RAISE(ABORT, 'artist_vetado: artista.estado_id = 4');
END;
--> statement-breakpoint

CREATE TRIGGER trg_prevent_vetado_actividad
BEFORE INSERT ON participacion_actividad
FOR EACH ROW
WHEN (NEW.estado IS NULL OR NEW.estado != 'completado')
AND (
    SELECT a.estado_id FROM artista a
    JOIN participacion_edicion pe ON pe.artista_id = a.id
    WHERE pe.id = NEW.participacion_id
) = 4
BEGIN
    SELECT RAISE(ABORT, 'artist_vetado: artista.estado_id = 4');
END;
--> statement-breakpoint

CREATE TRIGGER trg_cancel_all_on_veto
AFTER UPDATE OF estado_id ON artista
FOR EACH ROW
WHEN NEW.estado_id = 4 AND OLD.estado_id != 4
BEGIN
    UPDATE participacion_exposicion
    SET estado = 'cancelado',
        updated_at = CURRENT_TIMESTAMP,
        notas = COALESCE(notas || ' | ', '') || 'Auto-cancelado por veto: ' || datetime('now')
    WHERE participacion_id IN (
        SELECT id FROM participacion_edicion WHERE artista_id = NEW.id
    )
    AND estado IN ('seleccionado', 'confirmado');

    UPDATE participacion_actividad
    SET estado = 'cancelado',
        updated_at = CURRENT_TIMESTAMP,
        notas = COALESCE(notas || ' | ', '') || 'Auto-cancelado por veto: ' || datetime('now')
    WHERE participacion_id IN (
        SELECT id FROM participacion_edicion WHERE artista_id = NEW.id
    )
    AND estado IN ('seleccionado', 'confirmado');
END;
--> statement-breakpoint

PRAGMA foreign_keys = ON;