-- =============================================================================
-- Agregar campo slug a la tabla artista
-- =============================================================================
-- El slug se usa para:
-- - Identificador único legible para URLs
-- - Nombre de carpeta en CDN (cdn/bucket/artistas/{slug}/)
-- - Se genera automáticamente del pseudónimo o nombre
-- =============================================================================

ALTER TABLE artista ADD COLUMN slug TEXT;

-- Crear índice único para garantizar slugs no duplicados
CREATE UNIQUE INDEX idx_artista_slug ON artista(slug);
