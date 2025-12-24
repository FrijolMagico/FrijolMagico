-- =============================================================================
-- FRIJOL MÁGICO - MIGRATIONS TRACKING TABLE
-- =============================================================================
-- This table tracks which migrations have been applied to the database.
-- It is automatically managed by the migrate.sh script.
-- =============================================================================

CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
