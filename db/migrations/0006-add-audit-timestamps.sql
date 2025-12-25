-- =============================================================================
-- ADD AUDIT TIMESTAMPS (created_at, updated_at) TO REMAINING TABLES
-- =============================================================================
-- Note: SQLite doesn't allow non-constant DEFAULT in ALTER TABLE for tables
-- with existing data. Strategy: add nullable columns, set values, then 
-- rely on triggers and application layer to set values for new records.
-- =============================================================================

-- =============================================================================
-- DISCIPLINA (has 4 records)
-- =============================================================================
ALTER TABLE disciplina ADD COLUMN created_at TEXT;
ALTER TABLE disciplina ADD COLUMN updated_at TEXT;

UPDATE disciplina SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_disciplina_created_at
AFTER INSERT ON disciplina
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE disciplina SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- ARTISTA (has 87 records)
-- =============================================================================
ALTER TABLE artista ADD COLUMN created_at TEXT;
ALTER TABLE artista ADD COLUMN updated_at TEXT;

UPDATE artista SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER trg_artista_updated_at
AFTER UPDATE ON artista
FOR EACH ROW
BEGIN
    UPDATE artista SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_artista_created_at
AFTER INSERT ON artista
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- ARTISTA_IMAGEN (empty table)
-- =============================================================================
ALTER TABLE artista_imagen ADD COLUMN created_at TEXT;
ALTER TABLE artista_imagen ADD COLUMN updated_at TEXT;

CREATE TRIGGER trg_artista_imagen_updated_at
AFTER UPDATE ON artista_imagen
FOR EACH ROW
BEGIN
    UPDATE artista_imagen SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_artista_imagen_created_at
AFTER INSERT ON artista_imagen
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista_imagen SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- ARTISTA_INVITADO (empty table)
-- =============================================================================
ALTER TABLE artista_invitado ADD COLUMN created_at TEXT;
ALTER TABLE artista_invitado ADD COLUMN updated_at TEXT;

CREATE TRIGGER trg_artista_invitado_updated_at
AFTER UPDATE ON artista_invitado
FOR EACH ROW
BEGIN
    UPDATE artista_invitado SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_artista_invitado_created_at
AFTER INSERT ON artista_invitado
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista_invitado SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- AGRUPACION (has 2 records)
-- =============================================================================
ALTER TABLE agrupacion ADD COLUMN created_at TEXT;
ALTER TABLE agrupacion ADD COLUMN updated_at TEXT;

UPDATE agrupacion SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_agrupacion_created_at
AFTER INSERT ON agrupacion
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE agrupacion SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- AGRUPACION_MIEMBRO (empty table)
-- =============================================================================
ALTER TABLE agrupacion_miembro ADD COLUMN created_at TEXT;
ALTER TABLE agrupacion_miembro ADD COLUMN updated_at TEXT;

CREATE TRIGGER trg_agrupacion_miembro_updated_at
AFTER UPDATE ON agrupacion_miembro
FOR EACH ROW
BEGIN
    UPDATE agrupacion_miembro SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_agrupacion_miembro_created_at
AFTER INSERT ON agrupacion_miembro
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE agrupacion_miembro SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
