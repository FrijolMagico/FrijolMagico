-- Custom SQL migration file, put your code below! --

-- Migración: 005_auth
-- Descripción: Tablas de autenticación Better Auth (Google OAuth)

-- user: Tabla de usuarios
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    emailverified INTEGER NOT NULL DEFAULT 0,
    name TEXT,
    image TEXT,
    createdat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_user_email ON user (email);
--> statement-breakpoint

-- session: Tabla de sesiones
CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresat TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ipaddress TEXT,
    useragent TEXT,
    userid TEXT NOT NULL,

    CONSTRAINT fk_session_user FOREIGN KEY (userid)
    REFERENCES user (id) ON DELETE CASCADE
);
--> statement-breakpoint

-- Índice para búsqueda por userId (optimización de queries)
CREATE INDEX IF NOT EXISTS idx_session_userid ON session (userid);
--> statement-breakpoint

-- account: Tabla de cuentas OAuth (Google)
CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountid TEXT NOT NULL,
    providerid TEXT NOT NULL,
    userid TEXT NOT NULL,
    accesstoken TEXT,
    refreshtoken TEXT,
    accesstokenexpiresat TEXT,
    refreshtokenexpiresat TEXT,
    scope TEXT,
    idtoken TEXT,
    createdat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_account_user FOREIGN KEY (userid)
    REFERENCES user (id) ON DELETE CASCADE
);
--> statement-breakpoint

-- Índice para búsqueda por userId
CREATE INDEX IF NOT EXISTS idx_account_userid ON account (userid);
--> statement-breakpoint

-- verification: Tabla de verificaciones (tokens de email)
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresat TEXT NOT NULL,
    createdat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- Índice para búsqueda por identifier
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification (
    identifier
);
--> statement-breakpoint

-- TRIGGERS: updated_at (idempotentes, guarded para evitar re-updates)

-- Trigger para user.updatedAt
DROP TRIGGER IF EXISTS trg_user_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_user_updated_at
AFTER UPDATE ON user
FOR EACH ROW
WHEN new.updatedat = old.updatedat
BEGIN
    UPDATE user SET updatedat = CURRENT_TIMESTAMP
    WHERE id = new.id AND updatedat = old.updatedat;
END;
--> statement-breakpoint

-- Trigger para session.updatedAt
DROP TRIGGER IF EXISTS trg_session_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_session_updated_at
AFTER UPDATE ON session
FOR EACH ROW
WHEN new.updatedat = old.updatedat
BEGIN
    UPDATE session SET updatedat = CURRENT_TIMESTAMP
    WHERE id = new.id AND updatedat = old.updatedat;
END;
--> statement-breakpoint

-- Trigger para account.updatedAt
DROP TRIGGER IF EXISTS trg_account_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_account_updated_at
AFTER UPDATE ON account
FOR EACH ROW
WHEN new.updatedat = old.updatedat
BEGIN
    UPDATE account SET updatedat = CURRENT_TIMESTAMP
    WHERE id = new.id AND updatedat = old.updatedat;
END;
--> statement-breakpoint

-- Trigger para verification.updatedAt
DROP TRIGGER IF EXISTS trg_verification_updated_at;
--> statement-breakpoint
CREATE TRIGGER trg_verification_updated_at
AFTER UPDATE ON verification
FOR EACH ROW
WHEN new.updatedat = old.updatedat
BEGIN
    UPDATE verification SET updatedat = CURRENT_TIMESTAMP
    WHERE id = new.id AND updatedat = old.updatedat;
END;
