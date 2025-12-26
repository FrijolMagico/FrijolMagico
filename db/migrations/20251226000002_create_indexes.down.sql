-- =============================================================================
-- ROLLBACK: DATABASE INDEXES
-- =============================================================================

DROP INDEX IF EXISTS idx_evento_edicion_evento;
DROP INDEX IF EXISTS idx_evento_edicion_dia_edicion;
DROP INDEX IF EXISTS idx_evento_edicion_dia_fecha;
DROP INDEX IF EXISTS idx_evento_edicion_dia_lugar;
DROP INDEX IF EXISTS idx_artista_imagen_artista;
DROP INDEX IF EXISTS idx_participante_evento_edicion;
DROP INDEX IF EXISTS idx_participante_artista;
DROP INDEX IF EXISTS idx_participante_estado;
DROP INDEX IF EXISTS idx_agrupacion_miembro_evento_edicion;
DROP INDEX IF EXISTS idx_agrupacion_miembro_agrupacion;
DROP INDEX IF EXISTS idx_evento_edicion_invitado_evento_edicion;
DROP INDEX IF EXISTS idx_evento_edicion_metrica_evento_edicion;
DROP INDEX IF EXISTS idx_evento_edicion_metrica_fecha;
DROP INDEX IF EXISTS idx_evento_edicion_snapshot_evento_edicion;
