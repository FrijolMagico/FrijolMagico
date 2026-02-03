-- Custom SQL migration file, put your code below!

-- Migración: 0006_auth_fix_column_names_snake_case
-- Descripción: Renombrar todas las columnas de tablas auth a formato snake_case

-- ============================================
-- TABLA: user
-- ============================================
ALTER TABLE user RENAME COLUMN emailverified TO email_verified;
--> statement-breakpoint
ALTER TABLE user RENAME COLUMN createdat TO created_at;
--> statement-breakpoint
ALTER TABLE user RENAME COLUMN updatedat TO updated_at;
--> statement-breakpoint

-- Recrear trigger para user
DROP TRIGGER IF EXISTS trg_user_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_user_updated_at
AFTER UPDATE ON user
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE user SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
--> statement-breakpoint

-- ============================================
-- TABLA: session
-- ============================================
ALTER TABLE session RENAME COLUMN expiresat TO expires_at;
--> statement-breakpoint
ALTER TABLE session RENAME COLUMN createdat TO created_at;
--> statement-breakpoint
ALTER TABLE session RENAME COLUMN updatedat TO updated_at;
--> statement-breakpoint
ALTER TABLE session RENAME COLUMN ipaddress TO ip_address;
--> statement-breakpoint
ALTER TABLE session RENAME COLUMN useragent TO user_agent;
--> statement-breakpoint
ALTER TABLE session RENAME COLUMN userid TO user_id;
--> statement-breakpoint

-- Eliminar índice antiguo y crear nuevo
DROP INDEX IF EXISTS idx_session_userid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_session_user_id ON session (user_id);
--> statement-breakpoint

-- Recrear trigger para session
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
-- TABLA: account
-- ============================================
ALTER TABLE account RENAME COLUMN accountid TO account_id;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN providerid TO provider_id;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN userid TO user_id;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN accesstoken TO access_token;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN refreshtoken TO refresh_token;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN accesstokenexpiresat TO access_token_expires_at;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN refreshtokenexpiresat TO refresh_token_expires_at;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN idtoken TO id_token;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN createdat TO created_at;
--> statement-breakpoint
ALTER TABLE account RENAME COLUMN updatedat TO updated_at;
--> statement-breakpoint

-- Eliminar índice antiguo y crear nuevo
DROP INDEX IF EXISTS idx_account_userid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_account_user_id ON account (user_id);
--> statement-breakpoint

-- Recrear trigger para account
DROP TRIGGER IF EXISTS trg_account_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_account_updated_at
AFTER UPDATE ON account
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE account SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
--> statement-breakpoint

-- ============================================
-- TABLA: verification
-- ============================================
ALTER TABLE verification RENAME COLUMN expiresat TO expires_at;
--> statement-breakpoint
ALTER TABLE verification RENAME COLUMN createdat TO created_at;
--> statement-breakpoint
ALTER TABLE verification RENAME COLUMN updatedat TO updated_at;
--> statement-breakpoint

-- Recrear trigger para verification
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
