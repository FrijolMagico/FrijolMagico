-- Migración: 004_participante
-- Descripción: Tablas del dominio participantes

-- tipo_actividad (catálogo)
CREATE TABLE IF NOT EXISTS tipo_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS modo_ingreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- evento_edicion_participante (SIN modo_ingreso - movido a tablas hijas)
CREATE TABLE IF NOT EXISTS evento_edicion_participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activo',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_participante_evento_edicion FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_participante_estado CHECK (
        estado IN (
            'renuncia',
            'expulsado',
            'cancelado',
            'activo',
            'completado'
        )
    )
);


-- participante_exposicion 
CREATE TABLE IF NOT EXISTS participante_exposicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    participante_id INTEGER,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 1,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exposicion_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_evento_edicion FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_postulacion FOREIGN KEY (postulacion_id) REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_participante FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_exposicion_agrupacion FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_exposicion_modo_ingreso FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),

    CONSTRAINT uq_exposicion_artista_evento UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_exposicion_estado
        CHECK (estado IN ('seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'))
);

-- participante_actividad (CON modo_ingreso_id)
CREATE TABLE IF NOT EXISTS participante_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    participante_id INTEGER,
    tipo_actividad_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 2,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_artista
        FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_evento_edicion
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_postulacion
        FOREIGN KEY (postulacion_id) REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_participante
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_tipo_actividad
        FOREIGN KEY (tipo_actividad_id) REFERENCES tipo_actividad (id),
    CONSTRAINT fk_actividad_agrupacion
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_actividad_modo_ingreso
        FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),

    CONSTRAINT chk_actividad_estado
        CHECK (estado IN ('seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'))
);

-- actividad (CON cupos)
CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_actividad_id INTEGER UNIQUE NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    duracion_minutos INTEGER,
    ubicacion TEXT,
    hora_inicio TEXT,
    cupos INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_participante_actividad  FOREIGN KEY (participante_actividad_id) REFERENCES participante_actividad (id) ON DELETE CASCADE,
    CONSTRAINT chk_actividad_duracion CHECK (duracion_minutos IS NULL OR duracion_minutos > 0)
);


-- INDEXES
CREATE INDEX IF NOT EXISTS idx_participante_evento_edicion ON evento_edicion_participante (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_participante_artista ON evento_edicion_participante (artista_id);
CREATE INDEX IF NOT EXISTS idx_participante_estado ON evento_edicion_participante (estado);


CREATE INDEX IF NOT EXISTS idx_exposicion_artista ON participante_exposicion (artista_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_evento_edicion ON participante_exposicion (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_postulacion ON participante_exposicion (postulacion_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_participante ON participante_exposicion (participante_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_estado ON participante_exposicion (estado);
CREATE INDEX IF NOT EXISTS idx_exposicion_disciplina ON participante_exposicion (disciplina_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_agrupacion ON participante_exposicion (agrupacion_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_modo_ingreso ON participante_exposicion (modo_ingreso_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_puntaje ON participante_exposicion (puntaje DESC) WHERE puntaje IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_actividad_artista ON participante_actividad (artista_id);
CREATE INDEX IF NOT EXISTS idx_actividad_evento_edicion ON participante_actividad (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_postulacion ON participante_actividad (postulacion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_participante ON participante_actividad (participante_id);
CREATE INDEX IF NOT EXISTS idx_actividad_estado ON participante_actividad (estado);
CREATE INDEX IF NOT EXISTS idx_actividad_tipo_actividad ON participante_actividad (tipo_actividad_id);
CREATE INDEX IF NOT EXISTS idx_actividad_agrupacion ON participante_actividad (agrupacion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_modo_ingreso ON participante_actividad (modo_ingreso_id);
CREATE INDEX IF NOT EXISTS idx_actividad_puntaje ON participante_actividad (puntaje DESC) WHERE puntaje IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_actividad_participante_actividad ON actividad (participante_actividad_id);

-- TRIGGERS: updated_at (non-recursive pattern)

DROP TRIGGER IF EXISTS trg_tipo_actividad_updated_at;
CREATE TRIGGER trg_tipo_actividad_updated_at
BEFORE UPDATE ON tipo_actividad
FOR EACH ROW
WHEN OLD.updated_at IS DISTINCT FROM NEW.updated_at OR NEW.updated_at IS NULL
BEGIN
    SELECT RAISE(IGNORE) WHERE NEW.updated_at IS NOT NULL AND NEW.updated_at != CURRENT_TIMESTAMP;
END;

-- Note: BEFORE UPDATE cannot modify NEW row in all SQLite versions reliably.
-- Alternative pattern (AFTER UPDATE with guard clause):
DROP TRIGGER IF EXISTS trg_tipo_actividad_updated_at;
CREATE TRIGGER trg_tipo_actividad_updated_at
AFTER UPDATE ON tipo_actividad
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE tipo_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;

DROP TRIGGER IF EXISTS trg_modo_ingreso_updated_at;
CREATE TRIGGER trg_modo_ingreso_updated_at
AFTER UPDATE ON modo_ingreso
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE modo_ingreso SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;

DROP TRIGGER IF EXISTS trg_evento_edicion_participante_updated_at;
CREATE TRIGGER trg_evento_edicion_participante_updated_at
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;

DROP TRIGGER IF EXISTS trg_participante_exposicion_updated_at;
CREATE TRIGGER trg_participante_exposicion_updated_at
AFTER UPDATE ON participante_exposicion
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE participante_exposicion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;

DROP TRIGGER IF EXISTS trg_participante_actividad_updated_at;
CREATE TRIGGER trg_participante_actividad_updated_at
AFTER UPDATE ON participante_actividad
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE participante_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;

DROP TRIGGER IF EXISTS trg_actividad_updated_at;
CREATE TRIGGER trg_actividad_updated_at
AFTER UPDATE ON actividad
FOR EACH ROW
WHEN OLD.updated_at != NEW.updated_at
BEGIN
    UPDATE actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;


-- ============================================
-- Triggers: cascade cancel, veto
-- ============================================
-- NOTE: Auto-creation triggers removed - evento_edicion_participante 
-- must be created explicitly in application layer before creating
-- participante_exposicion or participante_actividad records.

-- Triggers: cascade cancel
DROP TRIGGER IF EXISTS trg_cascade_cancel_to_exposicion;
CREATE TRIGGER trg_cascade_cancel_to_exposicion
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
WHEN NEW.estado = 'cancelado' AND OLD.estado != 'cancelado'
BEGIN
    UPDATE participante_exposicion
    SET estado = 'cancelado',
        notas = COALESCE(notas || ' | ', '') || 'Cancelado por estado global: ' || datetime('now')
    WHERE participante_id = NEW.id
      AND estado NOT IN ('cancelado', 'desistido', 'ausente', 'completado');

    UPDATE participante_actividad
    SET estado = 'cancelado',
        notas = COALESCE(notas || ' | ', '') || 'Cancelado por estado global: ' || datetime('now')
    WHERE participante_id = NEW.id
      AND estado NOT IN ('cancelado', 'desistido', 'ausente', 'completado');
END;

-- Triggers: veto prevention on insert
-- Consistent logic: prevent insertion of vetoed artists unless estado = 'completado'
-- This ensures consistent behavior across both exposicion and actividad tables
DROP TRIGGER IF EXISTS trg_prevent_vetado_exposicion;
CREATE TRIGGER trg_prevent_vetado_exposicion
BEFORE INSERT ON participante_exposicion
FOR EACH ROW
WHEN
    NEW.artista_id IS NOT NULL
  AND (NEW.estado IS NULL OR NEW.estado != 'completado')
  AND (
    SELECT estado_id
    FROM artista
    WHERE id = NEW.artista_id
  ) = 4
BEGIN
  SELECT RAISE(ABORT, 'artist_vetado: artista.estado_id = 4');
END;

DROP TRIGGER IF EXISTS trg_prevent_vetado_actividad;
CREATE TRIGGER trg_prevent_vetado_actividad
BEFORE INSERT ON participante_actividad
FOR EACH ROW
WHEN
  NEW.artista_id IS NOT NULL
  AND (NEW.estado IS NULL OR NEW.estado != 'completado')
  AND (
    SELECT estado_id
    FROM artista
    WHERE id = NEW.artista_id
  ) = 4
BEGIN
  SELECT RAISE(ABORT, 'artist_vetado: artista.estado_id = 4');
END;

DROP TRIGGER IF EXISTS trg_cancel_all_on_veto;
CREATE TRIGGER trg_cancel_all_on_veto
AFTER UPDATE OF estado_id ON artista
FOR EACH ROW
WHEN NEW.estado_id = 4 AND OLD.estado_id != 4
BEGIN
  -- Cancel solo participaciones 'activo' con hijas en estados 'seleccionado' o 'confirmado'
  -- NO cancela participaciones 'completado' (eventos pasados)
  UPDATE evento_edicion_participante
  SET estado = 'cancelado',
      updated_at = CURRENT_TIMESTAMP,
      notas = COALESCE(notas, '') || '\nAuto-canceled due to artista vetado (estado_id=4)'
  WHERE artista_id = NEW.id
    AND estado = 'activo'
    AND (
      EXISTS (
        SELECT 1 FROM participante_exposicion pe
        WHERE pe.participante_id = evento_edicion_participante.id
          AND pe.estado IN ('seleccionado', 'confirmado')
      )
      OR EXISTS (
        SELECT 1 FROM participante_actividad pa
        WHERE pa.participante_id = evento_edicion_participante.id
          AND pa.estado IN ('seleccionado', 'confirmado')
      )
    );
END;
