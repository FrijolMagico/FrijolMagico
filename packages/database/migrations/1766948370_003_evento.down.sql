-- ============================================
-- Rollback: 003_evento
-- NOTA: Rollback deshabilitado intencionalmente
-- ============================================

-- DROP TRIGGER IF EXISTS trg_evento_edicion_postulacion_updated_at;
-- DROP TABLE IF EXISTS evento_edicion_postulacion;

-- DROP INDEX IF EXISTS idx_evento_edicion_snapshot_evento_edicion;
-- DROP TABLE IF EXISTS evento_edicion_snapshot;

-- DROP INDEX IF EXISTS idx_evento_edicion_metrica_fecha;
-- DROP INDEX IF EXISTS idx_evento_edicion_metrica_evento_edicion;
-- DROP TABLE IF EXISTS evento_edicion_metrica;

-- DROP TRIGGER IF EXISTS trg_evento_edicion_dia_updated_at;
-- DROP INDEX IF EXISTS idx_evento_edicion_dia_lugar;
-- DROP INDEX IF EXISTS idx_evento_edicion_dia_fecha;
-- DROP INDEX IF EXISTS idx_evento_edicion_dia_edicion;
-- DROP TABLE IF EXISTS evento_edicion_dia;

-- DROP TRIGGER IF EXISTS trg_evento_edicion_updated_at;
-- DROP INDEX IF EXISTS idx_evento_edicion_evento;
-- DROP INDEX IF EXISTS idx_evento_edicion_slug;
-- DROP INDEX IF EXISTS idx_evento_edicion_numero;
-- DROP TABLE IF EXISTS evento_edicion;

-- DROP TRIGGER IF EXISTS trg_evento_updated_at;
-- DROP INDEX IF EXISTS idx_evento_slug;
-- DROP TABLE IF EXISTS evento;
