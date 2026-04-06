-- Custom SQL migration file, put your code below! --

-- Migración: 0007_auth_fix_expires_at_integer
-- Descripción: Cambiar tipo de expires_at de TEXT a INTEGER para compatibilidad con Better Auth timestamps

-- ============================================
-- TABLA: session
-- ============================================
-- SQLite no permite ALTER COLUMN directamente, necesitamos recrear la tabla

-- 1. Crear tabla temporal con estructura correcta
CREATE TABLE session_new (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL,

    CONSTRAINT fk_session_user FOREIGN KEY (user_id)
    REFERENCES user (id) ON DELETE CASCADE
);
--> statement-breakpoint

-- 2. Migrar datos existentes (convertir TEXT a INTEGER si es posible, o dejar que Better Auth maneje nuevas sesiones)
-- Si hay datos existentes con formato TEXT, los dejamos como están por ahora
-- Better Auth creará nuevas sesiones con formato INTEGER
INSERT INTO session_new (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id)
SELECT 
    id,
    CASE 
        WHEN expires_at IS NULL THEN 0
        WHEN typeof(expires_at) = 'integer' THEN CAST(expires_at AS INTEGER)
        ELSE 0  -- Valor por defecto para datos existentes en formato TEXT
    END,
    token,
    created_at,
    updated_at,
    ip_address,
    user_agent,
    user_id
FROM session;
--> statement-breakpoint

-- 3. Eliminar tabla antigua
DROP TABLE session;
--> statement-breakpoint

-- 4. Renombrar tabla nueva
ALTER TABLE session_new RENAME TO session;
--> statement-breakpoint

-- 5. Recrear índices
CREATE INDEX IF NOT EXISTS idx_session_user_id ON session (user_id);
--> statement-breakpoint

-- 6. Recrear trigger
DROP TRIGGER IF EXISTS trg_session_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_session_updated_at
AFTER UPDATE ON session
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE session SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- 2. Migrar datos existentes
INSERT INTO verification_new (id, identifier, value, expires_at, created_at, updated_at)
SELECT 
    id,
    identifier,
    value,
    CASE 
        WHEN expires_at IS NULL THEN 0
        WHEN typeof(expires_at) = 'integer' THEN CAST(expires_at AS INTEGER)
        ELSE 0  -- Valor por defecto para datos existentes en formato TEXT
    END,
    created_at,
    updated_at
FROM verification;
--> statement-breakpoint

-- 3. Eliminar tabla antigua
DROP TABLE verification;
--> statement-breakpoint

-- 4. Renombrar tabla nueva
ALTER TABLE verification_new RENAME TO verification;
--> statement-breakpoint

-- 5. Recrear índices
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification (identifier);
--> statement-breakpoint

-- 6. Recrear trigger
DROP TRIGGER IF EXISTS trg_verification_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_verification_updated_at
AFTER UPDATE ON verification
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE verification SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
