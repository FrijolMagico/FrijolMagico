-- Migration: Convert remaining auth tables timestamp columns from TEXT to INTEGER
-- Changes session, account, and verification tables to use Unix timestamps

-- ============================================
-- TABLA: session
-- ============================================
-- SQLite no permite ALTER COLUMN directamente, necesitamos recrear la tabla

-- 1. Crear tabla temporal con estructura correcta
CREATE TABLE session_new (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL,

    CONSTRAINT fk_session_user FOREIGN KEY (user_id)
    REFERENCES user (id) ON DELETE CASCADE
);
--> statement-breakpoint

-- 2. No migrar datos - las sesiones se recrean automáticamente
-- 3. Eliminar tabla antigua
DROP TABLE session;
--> statement-breakpoint

-- 4. Renombrar tabla nueva
ALTER TABLE session_new RENAME TO session;
--> statement-breakpoint

-- 5. Recrear índices
CREATE INDEX idx_session_user_id ON session (user_id);
--> statement-breakpoint

-- ============================================
-- TABLA: account
-- ============================================

-- 1. Crear tabla temporal con estructura correcta
CREATE TABLE account_new (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    id_token TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    CONSTRAINT fk_account_user FOREIGN KEY (user_id)
    REFERENCES user (id) ON DELETE CASCADE
);
--> statement-breakpoint

-- 2. No migrar datos - las cuentas OAuth se recrean automáticamente
-- 3. Eliminar tabla antigua
DROP TABLE account;
--> statement-breakpoint

-- 4. Renombrar tabla nueva
ALTER TABLE account_new RENAME TO account;
--> statement-breakpoint

-- 5. Recrear índices
CREATE INDEX idx_account_user_id ON account (user_id);
--> statement-breakpoint

-- ============================================
-- TABLA: verification
-- ============================================

-- 1. Crear tabla temporal con estructura correcta
CREATE TABLE verification_new (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint

-- 2. No migrar datos - los tokens de verificación son temporales
-- 3. Eliminar tabla antigua
DROP TABLE verification;
--> statement-breakpoint

-- 4. Renombrar tabla nueva
ALTER TABLE verification_new RENAME TO verification;
--> statement-breakpoint

-- 5. Recrear índices
CREATE INDEX idx_verification_identifier ON verification (identifier);
