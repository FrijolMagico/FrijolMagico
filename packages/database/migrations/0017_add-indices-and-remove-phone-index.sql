-- HIGH PRIORITY: Indexes for artist location filters
CREATE INDEX idx_artista_pais ON artista (pais) WHERE pais IS NOT NULL;
--> statement-breakpoint
CREATE INDEX idx_artista_ciudad ON artista (ciudad) WHERE ciudad IS NOT NULL;
--> statement-breakpoint
CREATE INDEX idx_artista_pais_deleted ON artista (pais, deleted_at) WHERE pais IS NOT NULL AND deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX idx_artista_ciudad_deleted ON artista (ciudad, deleted_at) WHERE ciudad IS NOT NULL AND deleted_at IS NULL;
--> statement-breakpoint
-- MEDIUM PRIORITY: Additional search indexes
CREATE INDEX idx_lugar_ciudad ON lugar (ciudad) WHERE ciudad IS NOT NULL;
--> statement-breakpoint
CREATE INDEX idx_event_edicion_nombre ON evento_edicion (nombre) WHERE nombre IS NOT NULL;
--> statement-breakpoint
-- LOW PRIORITY: Composite indexes for complex queries
CREATE INDEX idx_artista_estado_pais ON artista (estado_id, pais);
--> statement-breakpoint
CREATE INDEX idx_artista_estado_ciudad ON artista (estado_id, ciudad);
--> statement-breakpoint
-- REMOVE: Unnecessary index
DROP INDEX IF EXISTS idx_artista_telefono;