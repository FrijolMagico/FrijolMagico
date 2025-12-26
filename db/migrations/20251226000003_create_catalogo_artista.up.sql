-- =============================================================================
-- CATALOGO ARTISTA
-- =============================================================================
-- Bridge table defining which artists belong to the public catalog.
-- Uses fractional indexing (lexicographic strings) for efficient ordering.
-- Note: Uses IF NOT EXISTS for idempotent migrations
-- =============================================================================

CREATE TABLE IF NOT EXISTS catalogo_artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL UNIQUE,
    orden TEXT NOT NULL,
    destacado INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_catalogo_artista FOREIGN KEY (artista_id)
        REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT chk_catalogo_artista_destacado CHECK (destacado IN (0, 1)),
    CONSTRAINT chk_catalogo_artista_activo CHECK (activo IN (0, 1))
);

CREATE TRIGGER IF NOT EXISTS trg_catalogo_artista_updated_at
AFTER UPDATE ON catalogo_artista
FOR EACH ROW
BEGIN
    UPDATE catalogo_artista SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX IF NOT EXISTS idx_catalogo_artista_orden ON catalogo_artista(orden);
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_activo ON catalogo_artista(activo);
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_destacado ON catalogo_artista(destacado);
