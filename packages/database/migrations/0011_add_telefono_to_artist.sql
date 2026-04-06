-- Custom SQL migration file, put your code below! --

-- Migración: 0011_add_telefono_and_deleted_at
-- Descripción: Agregar campos telefono y deleted_at a artista

-- ============================================
-- 1. Agregar columnas directamente (más seguro)
-- ============================================

ALTER TABLE artista ADD COLUMN telefono TEXT;
--> statement-breakpoint

ALTER TABLE artista ADD COLUMN deleted_at TEXT;
--> statement-breakpoint

-- ============================================
-- 2. Recrear índices (si es necesario)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_artista_telefono ON artista (telefono);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_artista_deleted_at ON artista (deleted_at);
