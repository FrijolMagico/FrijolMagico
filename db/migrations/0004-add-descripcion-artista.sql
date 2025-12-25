-- =============================================================================
-- MIGRATION 0004: Add descripcion to artista
-- =============================================================================
-- Description: 
--   - Add 'descripcion' field to artista table for artist bio/description
--   - Stored as Markdown text for rich text rendering
-- =============================================================================

-- Add descripcion to artista (optional, Markdown text)
ALTER TABLE artista ADD COLUMN descripcion TEXT;
