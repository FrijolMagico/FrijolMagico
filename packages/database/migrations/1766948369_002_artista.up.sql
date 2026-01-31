-- Migración: 002_artista
-- Descripción: Tablas del dominio artistas

-- artista_estado (debe crearse antes de artista por la FK)
CREATE TABLE IF NOT EXISTS artista_estado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- artista
CREATE TABLE IF NOT EXISTS artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estado_id INTEGER NOT NULL DEFAULT 1,
    nombre TEXT,
    pseudonimo TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    rut TEXT UNIQUE,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_artista_estado FOREIGN KEY (
        estado_id
    ) REFERENCES artista_estado (id)
);

-- artista_imagen
CREATE TABLE IF NOT EXISTS artista_imagen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    imagen_url TEXT NOT NULL,
    tipo TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_artista_imagen_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT chk_artista_imagen_tipo CHECK (
        tipo IN ('avatar', 'galeria')
    )
);

-- artista_historial
CREATE TABLE IF NOT EXISTS artista_historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,
    orden INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_artista_historial_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT uq_artista_historial_orden UNIQUE (artista_id, orden),
    CONSTRAINT chk_artista_historial_orden CHECK (orden > 0),
    CONSTRAINT chk_artista_historial_has_data CHECK (
        pseudonimo IS NOT NULL
        OR correo IS NOT NULL
        OR rrss IS NOT NULL
        OR ciudad IS NOT NULL
        OR pais IS NOT NULL
    )
);

-- catalogo_artista
CREATE TABLE IF NOT EXISTS catalogo_artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL UNIQUE,
    orden TEXT NOT NULL,
    destacado INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 1,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_catalogo_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT chk_catalogo_artista_destacado CHECK (destacado IN (0, 1)),
    CONSTRAINT chk_catalogo_artista_activo CHECK (activo IN (0, 1))
);

-- agrupacion
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    correo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- INDEXES
-- artista
CREATE UNIQUE INDEX IF NOT EXISTS idx_artista_slug ON artista (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_artista_correo_pseudonimo ON artista (
    correo, pseudonimo
)
WHERE correo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_artista_estado ON artista (estado_id);

-- artista_imagen
CREATE INDEX IF NOT EXISTS idx_artista_imagen_artista ON artista_imagen (
    artista_id
);
CREATE INDEX IF NOT EXISTS idx_artista_imagen_artista_tipo ON artista_imagen (
    artista_id, tipo
);

-- artista_historial
CREATE INDEX IF NOT EXISTS idx_artista_historial_artista ON artista_historial (
    artista_id
);
CREATE INDEX IF NOT EXISTS idx_artista_historial_pseudonimo
ON artista_historial (
    pseudonimo
);
CREATE INDEX IF NOT EXISTS idx_artista_historial_orden ON artista_historial (
    artista_id, orden
);

-- catalogo_artista
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_orden ON catalogo_artista (
    orden
);
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_activo ON catalogo_artista (
    activo
);
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_destacado ON catalogo_artista (
    destacado
);

-- TRIGGERS
-- updated_at triggers (idempotent, guarded to avoid re-updates)
DROP TRIGGER IF EXISTS trg_artista_estado_updated_at;
CREATE TRIGGER trg_artista_estado_updated_at
AFTER UPDATE ON artista_estado
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE artista_estado SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

DROP TRIGGER IF EXISTS trg_artista_updated_at;
CREATE TRIGGER trg_artista_updated_at
AFTER UPDATE ON artista
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE artista SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

DROP TRIGGER IF EXISTS trg_artista_imagen_updated_at;
CREATE TRIGGER trg_artista_imagen_updated_at
AFTER UPDATE ON artista_imagen
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE artista_imagen SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

DROP TRIGGER IF EXISTS trg_catalogo_artista_updated_at;
CREATE TRIGGER trg_catalogo_artista_updated_at
AFTER UPDATE ON catalogo_artista
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE catalogo_artista SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

DROP TRIGGER IF EXISTS trg_agrupacion_updated_at;
CREATE TRIGGER trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
