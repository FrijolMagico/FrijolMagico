-- =============================================================================
-- ROLLBACK: SCHEMA SYNC
-- =============================================================================
-- Note: SQLite does not support DROP COLUMN, so this rollback is limited.
-- The _migrations table and evento_edicion_dia_lugar cannot be restored.
-- =============================================================================

-- Remove index
DROP INDEX IF EXISTS idx_evento_edicion_dia_lugar;

-- Note: Cannot drop columns lugar_id, modalidad, ciudad in SQLite
-- These columns will remain but won't affect functionality
