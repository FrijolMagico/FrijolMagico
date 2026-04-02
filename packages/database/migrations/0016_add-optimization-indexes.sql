PRAGMA foreign_keys = OFF;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_evento_organizacion_id ON evento(organizacion_id);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_evento_edicion_created_at ON evento_edicion(created_at);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_artista_deleted_created ON artista(deleted_at, created_at);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS idx_artista_telefono ON artista(telefono);
--> statement-breakpoint

DROP INDEX IF EXISTS idx_artista_historial_orden;
--> statement-breakpoint

PRAGMA foreign_keys = ON;
