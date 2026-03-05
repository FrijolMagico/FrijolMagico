-- Custom SQL migration file, put your code below! --

-- Migration: 0012_add_deleted_at_to_artista_historial_and_catalogo
-- Description: Add soft delete to artist-dependent tables with automatic triggers

-- ============================================
-- 1. Add deleted_at column to artista_imagen
-- ============================================

ALTER TABLE artista_imagen ADD COLUMN deleted_at TEXT;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_artista_imagen_deleted_at ON artista_imagen (deleted_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_artista_imagen_artista_deleted ON artista_imagen (artista_id, deleted_at);
--> statement-breakpoint

-- ============================================
-- 2. Add deleted_at column to catalogo_artista
-- ============================================

ALTER TABLE catalogo_artista ADD COLUMN deleted_at TEXT;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_catalogo_artista_deleted_at ON catalogo_artista (deleted_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_catalogo_artista_artista_deleted ON catalogo_artista (artista_id, deleted_at);
--> statement-breakpoint

-- ============================================
-- 3. Triggers for automatic soft delete
-- ============================================

-- Trigger: mark artista_imagen as deleted when artista is marked as deleted
CREATE TRIGGER trigger_artista_soft_delete_imagen
AFTER UPDATE OF deleted_at ON artista
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
BEGIN
  UPDATE artista_imagen
  SET deleted_at = NEW.deleted_at
  WHERE artista_id = NEW.id
  AND deleted_at IS NULL;
END;
--> statement-breakpoint

-- Trigger: mark catalogo_artista as deleted when artista is marked as deleted
CREATE TRIGGER trigger_artista_soft_delete_catalogo
AFTER UPDATE OF deleted_at ON artista
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
BEGIN
  UPDATE catalogo_artista
  SET deleted_at = NEW.deleted_at
  WHERE artista_id = NEW.id
  AND deleted_at IS NULL;
END;
--> statement-breakpoint

-- ============================================
-- 4. Triggers for automatic restoration
-- ============================================

-- Trigger: restore artista_imagen when artista is restored
CREATE TRIGGER trigger_artista_restore_imagen
AFTER UPDATE OF deleted_at ON artista
FOR EACH ROW
WHEN NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL
BEGIN
  UPDATE artista_imagen
  SET deleted_at = NULL
  WHERE artista_id = NEW.id;
END;
--> statement-breakpoint

-- Trigger: restore catalogo_artista when artista is restored
CREATE TRIGGER trigger_artista_restore_catalogo
AFTER UPDATE OF deleted_at ON artista
FOR EACH ROW
WHEN NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL
BEGIN
  UPDATE catalogo_artista
  SET deleted_at = NULL
  WHERE artista_id = NEW.id;
END;
