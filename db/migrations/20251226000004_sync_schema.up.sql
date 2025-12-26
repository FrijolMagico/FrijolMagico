-- =============================================================================
-- SCHEMA SYNC - Synchronize existing database with expected schema
-- =============================================================================
-- This migration adds missing columns and cleans up legacy tables/columns
-- to align the existing database with the new schema definition.
-- =============================================================================

-- =============================================================================
-- 1. ADD MISSING COLUMNS TO evento_edicion_dia
-- =============================================================================

-- Add lugar_id column if not exists
ALTER TABLE evento_edicion_dia ADD COLUMN lugar_id INTEGER REFERENCES lugar(id) ON DELETE SET NULL;

-- Add modalidad column if not exists
ALTER TABLE evento_edicion_dia ADD COLUMN modalidad TEXT NOT NULL DEFAULT 'presencial' CHECK (modalidad IN ('presencial', 'online', 'hibrido'));

-- =============================================================================
-- 2. ADD MISSING COLUMN TO lugar
-- =============================================================================

-- Add ciudad column if not exists
ALTER TABLE lugar ADD COLUMN ciudad TEXT;

-- =============================================================================
-- 3. CREATE INDEX FOR NEW COLUMNS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_evento_edicion_dia_lugar
ON evento_edicion_dia (lugar_id);

-- =============================================================================
-- 4. CLEANUP: Drop legacy table evento_edicion_dia_lugar (if exists)
-- =============================================================================
-- This table was replaced by lugar_id in evento_edicion_dia

DROP TABLE IF EXISTS evento_edicion_dia_lugar;

-- =============================================================================
-- 5. CLEANUP: Drop legacy migrations table
-- =============================================================================
-- The old _migrations table is replaced by schema_migrations (Geni)

DROP TABLE IF EXISTS _migrations;
