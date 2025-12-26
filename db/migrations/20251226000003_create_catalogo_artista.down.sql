-- =============================================================================
-- ROLLBACK: CATALOGO ARTISTA
-- =============================================================================

DROP TRIGGER IF EXISTS trg_catalogo_artista_updated_at;
DROP INDEX IF EXISTS idx_catalogo_artista_orden;
DROP INDEX IF EXISTS idx_catalogo_artista_activo;
DROP INDEX IF EXISTS idx_catalogo_artista_destacado;
DROP TABLE IF EXISTS catalogo_artista;
