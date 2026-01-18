-- ============================================
-- Migración: 003_evento
-- Descripción: Tablas del dominio eventos
-- Tablas: evento, evento_edicion, evento_edicion_dia, evento_edicion_metrica, evento_edicion_snapshot, evento_edicion_postulacion
-- ============================================

-- evento
CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    slug TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_organizacion FOREIGN KEY (organizacion_id)
        REFERENCES organizacion (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_slug ON evento (slug) WHERE slug IS NOT NULL;

CREATE TRIGGER IF NOT EXISTS trg_evento_updated_at
AFTER UPDATE ON evento
FOR EACH ROW
BEGIN
    UPDATE evento SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- evento_edicion
CREATE TABLE IF NOT EXISTS evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    nombre TEXT,
    numero_edicion TEXT NOT NULL,
    slug TEXT,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (evento_id)
        REFERENCES evento (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_edicion_numero ON evento_edicion (evento_id, numero_edicion);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_edicion_slug ON evento_edicion (evento_id, slug);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_evento ON evento_edicion (evento_id);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_updated_at
AFTER UPDATE ON evento_edicion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- evento_edicion_dia
CREATE TABLE IF NOT EXISTS evento_edicion_dia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    lugar_id INTEGER,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    modalidad TEXT NOT NULL DEFAULT 'presencial',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_edicion_dia_edicion FOREIGN KEY (evento_edicion_id)
        REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_edicion_dia_lugar FOREIGN KEY (lugar_id)
        REFERENCES lugar (id) ON DELETE SET NULL,
    CONSTRAINT uq_evento_edicion_dia UNIQUE (evento_edicion_id, fecha),
    CONSTRAINT chk_evento_edicion_dia_modalidad CHECK (modalidad IN ('presencial', 'online', 'hibrido'))
);

CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_edicion ON evento_edicion_dia (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_fecha ON evento_edicion_dia (fecha);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_lugar ON evento_edicion_dia (lugar_id);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_dia_updated_at
AFTER UPDATE ON evento_edicion_dia
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- evento_edicion_metrica
CREATE TABLE IF NOT EXISTS evento_edicion_metrica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL,
    payload TEXT,
    fuente TEXT,
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_metrica_evento_edicion FOREIGN KEY (evento_edicion_id)
        REFERENCES evento_edicion (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evento_edicion_metrica_evento_edicion ON evento_edicion_metrica (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_metrica_fecha ON evento_edicion_metrica (fecha_registro);

-- evento_edicion_snapshot
CREATE TABLE IF NOT EXISTS evento_edicion_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    generado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_snapshot_evento_edicion FOREIGN KEY (evento_edicion_id)
        REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_snapshot UNIQUE (evento_edicion_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_evento_edicion_snapshot_evento_edicion ON evento_edicion_snapshot (evento_edicion_id);

-- evento_edicion_postulacion
CREATE TABLE IF NOT EXISTS evento_edicion_postulacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    tipo_participacion TEXT NOT NULL CHECK (tipo_participacion IN ('exposicion', 'actividad')),
    disciplina_id INTEGER,
    tipo_actividad_id INTEGER,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    dossier_url TEXT,
    puntaje INTEGER,
    notas_evaluacion TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_postulacion_evento_edicion
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_postulacion_artista
        FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_postulacion_disciplina
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_postulacion_tipo_actividad
        FOREIGN KEY (tipo_actividad_id) REFERENCES tipo_actividad (id),

    CONSTRAINT chk_postulacion_tipo_disciplina
        CHECK (
            (tipo_participacion = 'exposicion' AND disciplina_id IS NOT NULL AND tipo_actividad_id IS NULL)
            OR (tipo_participacion = 'actividad' AND tipo_actividad_id IS NOT NULL AND disciplina_id IS NULL)
        ),
    CONSTRAINT chk_postulacion_estado
        CHECK (estado IN ('pendiente', 'en_revision', 'seleccionado', 'rechazado', 'invitado'))
);

CREATE INDEX IF NOT EXISTS idx_postulacion_evento_edicion ON evento_edicion_postulacion (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_postulacion_artista ON evento_edicion_postulacion (artista_id);
CREATE INDEX IF NOT EXISTS idx_postulacion_estado ON evento_edicion_postulacion (estado);
CREATE INDEX IF NOT EXISTS idx_postulacion_tipo ON evento_edicion_postulacion (tipo_participacion);
CREATE INDEX IF NOT EXISTS idx_postulacion_puntaje ON evento_edicion_postulacion (puntaje DESC) WHERE puntaje IS NOT NULL;

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_postulacion_updated_at
AFTER UPDATE ON evento_edicion_postulacion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

