-- =============================================================================
-- FRIJOL MAGICO - INITIAL DATABASE SCHEMA
-- =============================================================================
-- Provider: libSQL (SQLite-compatible)
-- Format: ISO8601 for timestamps (TEXT), YYYY-MM-DD for dates (TEXT)
-- JSON: Stored as TEXT, validated in application layer
-- Note: Uses IF NOT EXISTS for idempotent migrations
-- =============================================================================

-- =============================================================================
-- ORGANIZACION
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    mision TEXT,
    vision TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_organizacion_updated_at
AFTER UPDATE ON organizacion
FOR EACH ROW
BEGIN
    UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

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

CREATE TRIGGER IF NOT EXISTS trg_organizacion_equipo_updated_at
AFTER UPDATE ON organizacion_equipo
FOR EACH ROW
BEGIN
    UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- LUGARES
-- =============================================================================

CREATE TABLE IF NOT EXISTS lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT,
    ciudad TEXT,
    coordenadas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- EVENTOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    slug TEXT,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_organizacion FOREIGN KEY (organizacion_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS trg_evento_updated_at
AFTER UPDATE ON evento
FOR EACH ROW
BEGIN
    UPDATE evento SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    nombre TEXT,
    slug TEXT,
    numero_edicion TEXT NOT NULL,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (evento_id)
    REFERENCES evento (id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_updated_at
AFTER UPDATE ON evento_edicion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS evento_edicion_dia (
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

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_dia_updated_at
AFTER UPDATE ON evento_edicion_dia
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- DISCIPLINAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- ARTISTAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    slug TEXT,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    descripcion TEXT,
    pais TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_artista_updated_at
AFTER UPDATE ON artista
FOR EACH ROW
BEGIN
    UPDATE artista SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS artista_imagen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    imagen_url TEXT NOT NULL,
    tipo TEXT,
    orden INTEGER,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_artista_imagen_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS trg_artista_imagen_updated_at
AFTER UPDATE ON artista_imagen
FOR EACH ROW
BEGIN
    UPDATE artista_imagen SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- POSTULACIONES
-- =============================================================================

CREATE TABLE IF NOT EXISTS evento_edicion_postulacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    disciplina_id INTEGER NOT NULL,
    dossier_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_postulacion_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_disciplina FOREIGN KEY (disciplina_id)
    REFERENCES disciplina (id)
);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_postulacion_updated_at
AFTER UPDATE ON evento_edicion_postulacion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- AGRUPACIONES
-- =============================================================================

CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    correo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS agrupacion_miembro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agrupacion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agrupacion_miembro_agrupacion FOREIGN KEY (agrupacion_id)
    REFERENCES agrupacion (id) ON DELETE CASCADE,
    CONSTRAINT fk_agrupacion_miembro_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT fk_agrupacion_miembro_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_agrupacion_miembro UNIQUE (artista_id, evento_edicion_id)
);

CREATE TRIGGER IF NOT EXISTS trg_agrupacion_miembro_updated_at
AFTER UPDATE ON agrupacion_miembro
FOR EACH ROW
BEGIN
    UPDATE agrupacion_miembro SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- PARTICIPANTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS evento_edicion_participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    estado TEXT NOT NULL,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participante_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_disciplina FOREIGN KEY (disciplina_id)
    REFERENCES disciplina (id),
    CONSTRAINT fk_participante_agrupacion FOREIGN KEY (agrupacion_id)
    REFERENCES agrupacion (id),
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_evento_edicion_participante_estado CHECK (
        estado IN ('postulado', 'seleccionado', 'confirmado', 'rechazado', 'cancelado')
    )
);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_participante_updated_at
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- INVITADOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS artista_invitado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT,
    rrss TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_artista_invitado_updated_at
AFTER UPDATE ON artista_invitado
FOR EACH ROW
BEGIN
    UPDATE artista_invitado SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS evento_edicion_invitado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_invitado_id INTEGER NOT NULL,
    rol TEXT NOT NULL,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitado_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_invitado_artista FOREIGN KEY (artista_invitado_id)
    REFERENCES artista_invitado (id) ON DELETE CASCADE,
    CONSTRAINT chk_evento_edicion_invitado_rol CHECK (LENGTH(TRIM(rol)) > 0)
);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_invitado_updated_at
AFTER UPDATE ON evento_edicion_invitado
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_invitado SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================================================
-- METRICAS Y SNAPSHOTS
-- =============================================================================

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
