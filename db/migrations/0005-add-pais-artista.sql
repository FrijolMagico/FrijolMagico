-- =============================================================================
-- MIGRATION 0005: Add pais to artista
-- =============================================================================
-- Description: 
--   - Add 'pais' field to artista table for artist's country
-- =============================================================================

-- Add pais to artista (optional)
ALTER TABLE artista ADD COLUMN pais TEXT;
