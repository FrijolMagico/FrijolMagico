-- ============================================
-- Rollback: 002_artista
-- NOTA: Rollback deshabilitado intencionalmente
-- ============================================

-- DROP TRIGGER IF EXISTS trg_catalogo_artista_updated_at;
-- DROP INDEX IF EXISTS idx_catalogo_artista_destacado;
-- DROP INDEX IF EXISTS idx_catalogo_artista_activo;
-- DROP INDEX IF EXISTS idx_catalogo_artista_orden;
-- DROP TABLE IF EXISTS catalogo_artista;

-- DROP INDEX IF EXISTS idx_artista_historial_orden;
-- DROP INDEX IF EXISTS idx_artista_historial_pseudonimo;
-- DROP INDEX IF EXISTS idx_artista_historial_artista;
-- DROP TABLE IF EXISTS artista_historial;

-- DROP TRIGGER IF EXISTS trg_artista_imagen_created_at;
-- DROP TRIGGER IF EXISTS trg_artista_imagen_updated_at;
-- DROP INDEX IF EXISTS idx_artista_imagen_artista;
-- DROP TABLE IF EXISTS artista_imagen;

-- DROP INDEX IF EXISTS idx_artista_estado;
-- DROP INDEX IF EXISTS idx_artista_correo_pseudonimo;
-- DROP INDEX IF EXISTS idx_artista_slug;
-- DROP TABLE IF EXISTS artista;

-- DROP TRIGGER IF EXISTS trg_artista_estado_updated_at;
-- DROP TABLE IF EXISTS artista_estado;
