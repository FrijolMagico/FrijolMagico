-- =============================================================================
-- MIGRATION 0003: Add ciudad to artista, correo to agrupacion
-- =============================================================================
-- Description: 
--   - Add 'ciudad' field to artista table for artist location
--   - Add 'correo' field to agrupacion table for collective email (optional)
-- =============================================================================

-- Add ciudad to artista (optional, for artist's city/location)
ALTER TABLE artista ADD COLUMN ciudad TEXT;

-- Add correo to agrupacion (optional, for collective's shared email)
ALTER TABLE agrupacion ADD COLUMN correo TEXT;
