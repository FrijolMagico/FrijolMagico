-- Migración: 003_evento
-- Descripción: Tablas del dominio eventos

-- evento
CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER,
    nombre TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_organizacion FOREIGN KEY (
        organizacion_id
    ) REFERENCES organizacion (id) ON DELETE SET NULL
);

-- evento_edicion
CREATE TABLE IF NOT EXISTS evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER,
    nombre TEXT,
    numero_edicion TEXT NOT NULL,
    slug TEXT,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (
        evento_id
    ) REFERENCES evento (id) ON DELETE SET NULL
);

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

    CONSTRAINT fk_evento_edicion_dia_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_edicion_dia_lugar FOREIGN KEY (
        lugar_id
    ) REFERENCES lugar (id) ON DELETE SET NULL,
    CONSTRAINT uq_evento_edicion_dia UNIQUE (evento_edicion_id, fecha),
    CONSTRAINT chk_evento_edicion_dia_modalidad CHECK (
        modalidad IN ('presencial', 'online', 'hibrido')
    )
);

-- evento_edicion_metrica
CREATE TABLE IF NOT EXISTS evento_edicion_metrica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER,
    tipo TEXT NOT NULL,
    valor REAL,
    payload TEXT,
    fuente TEXT,
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_metrica_evento_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE SET NULL
);

-- evento_edicion_snapshot
CREATE TABLE IF NOT EXISTS evento_edicion_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER,
    tipo TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    generado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_snapshot_evento_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE SET NULL,
    CONSTRAINT uq_snapshot UNIQUE (evento_edicion_id, tipo)
);

-- evento_edicion_postulacion
CREATE TABLE IF NOT EXISTS evento_edicion_postulacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    disciplina_id INTEGER NOT NULL,
    dossier_url TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_postulacion_evento_edicion
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_disciplina
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT chk_postulacion_estado
        CHECK (estado IN ('pendiente', 'seleccionado', 'rechazado', 'invitado'))
);


-- INDEXES
-- evento
CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_slug ON evento (slug);

-- evento_edicion
CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_edicion_numero ON evento_edicion (
    evento_id, numero_edicion
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_edicion_slug ON evento_edicion (
    evento_id, slug
);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_evento ON evento_edicion (
    evento_id
);

-- evento_edicion_dia
CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_edicion ON evento_edicion_dia (
    evento_edicion_id
);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_fecha ON evento_edicion_dia (
    fecha
);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_lugar ON evento_edicion_dia (
    lugar_id
);

-- evento_edicion_metrica
CREATE INDEX IF NOT EXISTS idx_evento_edicion_metrica_evento_edicion ON evento_edicion_metrica (
    evento_edicion_id
);
CREATE INDEX IF NOT EXISTS idx_evento_edicion_metrica_fecha ON evento_edicion_metrica (
    fecha_registro
);

CREATE INDEX IF NOT EXISTS idx_evento_edicion_snapshot_evento_edicion ON evento_edicion_snapshot (
    evento_edicion_id
);

-- evento_edicion_postulacion
CREATE INDEX IF NOT EXISTS idx_postulacion_evento_edicion ON evento_edicion_postulacion (
    evento_edicion_id
);
CREATE INDEX IF NOT EXISTS idx_postulacion_disciplina ON evento_edicion_postulacion (
    disciplina_id
);

-- TRIGGERS
-- updated_at triggers (idempotent, guarded to avoid re-updates)
DROP TRIGGER IF EXISTS trg_evento_updated_at;
CREATE TRIGGER trg_evento_updated_at
AFTER UPDATE ON evento
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE evento SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

DROP TRIGGER IF EXISTS trg_evento_edicion_updated_at;
CREATE TRIGGER trg_evento_edicion_updated_at
AFTER UPDATE ON evento_edicion
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;


DROP TRIGGER IF EXISTS trg_evento_edicion_dia_updated_at;
CREATE TRIGGER trg_evento_edicion_dia_updated_at
AFTER UPDATE ON evento_edicion_dia
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

-- evento_edicion_postulacion
DROP TRIGGER IF EXISTS trg_evento_edicion_postulacion_updated_at;
CREATE TRIGGER trg_evento_edicion_postulacion_updated_at
AFTER UPDATE ON evento_edicion_postulacion
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
