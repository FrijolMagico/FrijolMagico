-- =============================================================================
-- ROLLBACK: ARTISTA HISTORIAL
-- =============================================================================

DROP INDEX IF EXISTS idx_artista_historial_orden;
DROP INDEX IF EXISTS idx_artista_historial_pseudonimo;
DROP INDEX IF EXISTS idx_artista_historial_artista;
DROP TABLE IF EXISTS artista_historial;
