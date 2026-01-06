-- ============================================
-- Migración: 004_participante
-- Descripción: Tablas del dominio participantes
-- Tablas: tipo_actividad, modo_ingreso, evento_edicion_participante, 
--         participante_exposicion, participante_actividad, actividad
-- ============================================

-- tipo_actividad (catálogo)
CREATE TABLE IF NOT EXISTS tipo_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_tipo_actividad_nombre UNIQUE (nombre)
);

CREATE TRIGGER IF NOT EXISTS trg_tipo_actividad_updated_at
AFTER UPDATE ON tipo_actividad
FOR EACH ROW
BEGIN
    UPDATE tipo_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- modo_ingreso (catálogo)
CREATE TABLE IF NOT EXISTS modo_ingreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modo TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO modo_ingreso (id, modo, descripcion) VALUES 
(1, 'seleccion', 'Artista seleccionado mediante convocatoria abierta'),
(2, 'invitacion', 'Artista invitado directamente por la organización');

CREATE TRIGGER IF NOT EXISTS trg_modo_ingreso_updated_at
AFTER UPDATE ON modo_ingreso
FOR EACH ROW
BEGIN
    UPDATE modo_ingreso SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- evento_edicion_participante (SIN modo_ingreso - movido a tablas hijas)
CREATE TABLE IF NOT EXISTS evento_edicion_participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_participante_evento_edicion 
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista 
        FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_participante_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);

CREATE INDEX IF NOT EXISTS idx_participante_evento_edicion ON evento_edicion_participante (evento_edicion_id);
CREATE INDEX IF NOT EXISTS idx_participante_artista ON evento_edicion_participante (artista_id);
CREATE INDEX IF NOT EXISTS idx_participante_estado ON evento_edicion_participante (estado);

CREATE TRIGGER IF NOT EXISTS trg_evento_edicion_participante_updated_at
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- participante_exposicion (CON modo_ingreso_id)
CREATE TABLE IF NOT EXISTS participante_exposicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 1,
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_exposicion_participante 
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE CASCADE,
    CONSTRAINT fk_exposicion_disciplina 
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_exposicion_agrupacion 
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_exposicion_modo_ingreso 
        FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),
    CONSTRAINT uq_exposicion_participante UNIQUE (participante_id),
    CONSTRAINT chk_exposicion_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);

CREATE INDEX IF NOT EXISTS idx_exposicion_participante ON participante_exposicion (participante_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_disciplina ON participante_exposicion (disciplina_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_agrupacion ON participante_exposicion (agrupacion_id);
CREATE INDEX IF NOT EXISTS idx_exposicion_estado ON participante_exposicion (estado);
CREATE INDEX IF NOT EXISTS idx_exposicion_modo_ingreso ON participante_exposicion (modo_ingreso_id);

CREATE TRIGGER IF NOT EXISTS trg_participante_exposicion_updated_at
AFTER UPDATE ON participante_exposicion
FOR EACH ROW
BEGIN
    UPDATE participante_exposicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- participante_actividad (CON modo_ingreso_id)
CREATE TABLE IF NOT EXISTS participante_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id INTEGER NOT NULL,
    tipo_actividad_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 2,
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_actividad_participante 
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE CASCADE,
    CONSTRAINT fk_actividad_tipo 
        FOREIGN KEY (tipo_actividad_id) REFERENCES tipo_actividad (id),
    CONSTRAINT fk_actividad_agrupacion 
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_actividad_modo_ingreso 
        FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),
    CONSTRAINT chk_actividad_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);

CREATE INDEX IF NOT EXISTS idx_actividad_participante ON participante_actividad (participante_id);
CREATE INDEX IF NOT EXISTS idx_actividad_tipo ON participante_actividad (tipo_actividad_id);
CREATE INDEX IF NOT EXISTS idx_actividad_agrupacion ON participante_actividad (agrupacion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_estado ON participante_actividad (estado);
CREATE INDEX IF NOT EXISTS idx_actividad_modo_ingreso ON participante_actividad (modo_ingreso_id);

CREATE TRIGGER IF NOT EXISTS trg_participante_actividad_updated_at
AFTER UPDATE ON participante_actividad
FOR EACH ROW
BEGIN
    UPDATE participante_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- actividad (CON cupos)
CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_actividad_id INTEGER NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    duracion_minutos INTEGER,
    ubicacion TEXT,
    hora_inicio TEXT,
    cupos INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_actividad_participante_actividad 
        FOREIGN KEY (participante_actividad_id) REFERENCES participante_actividad (id) ON DELETE CASCADE,
    CONSTRAINT uq_actividad_participante_actividad UNIQUE (participante_actividad_id),
    CONSTRAINT chk_actividad_duracion CHECK (duracion_minutos IS NULL OR duracion_minutos > 0)
);

CREATE INDEX IF NOT EXISTS idx_actividad_participante_actividad ON actividad (participante_actividad_id);

CREATE TRIGGER IF NOT EXISTS trg_actividad_updated_at
AFTER UPDATE ON actividad
FOR EACH ROW
BEGIN
    UPDATE actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
