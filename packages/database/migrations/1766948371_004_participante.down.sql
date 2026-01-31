-- ============================================
-- Rollback: 004_participante
-- NOTA: Rollback deshabilitado intencionalmente
-- ============================================

-- DROP TRIGGER IF EXISTS trg_actividad_updated_at;
-- DROP INDEX IF EXISTS idx_actividad_participante_actividad;
-- DROP TABLE IF EXISTS actividad;

-- DROP TRIGGER IF EXISTS trg_participante_actividad_updated_at;
-- DROP INDEX IF EXISTS idx_actividad_modo_ingreso;
-- DROP INDEX IF EXISTS idx_actividad_estado;
-- DROP INDEX IF EXISTS idx_actividad_agrupacion;
-- DROP INDEX IF EXISTS idx_actividad_tipo;
-- DROP INDEX IF EXISTS idx_actividad_participante;
-- DROP TABLE IF EXISTS participante_actividad;

-- DROP TRIGGER IF EXISTS trg_participante_exposicion_updated_at;
-- DROP INDEX IF EXISTS idx_exposicion_modo_ingreso;
-- DROP INDEX IF EXISTS idx_exposicion_estado;
-- DROP INDEX IF EXISTS idx_exposicion_agrupacion;
-- DROP INDEX IF EXISTS idx_exposicion_disciplina;
-- DROP INDEX IF EXISTS idx_exposicion_participante;
-- DROP TABLE IF EXISTS participante_exposicion;

-- DROP TRIGGER IF EXISTS trg_evento_edicion_participante_updated_at;
-- DROP INDEX IF EXISTS idx_participante_estado;
-- DROP INDEX IF EXISTS idx_participante_artista;
-- DROP INDEX IF EXISTS idx_participante_evento_edicion;
-- DROP TABLE IF EXISTS evento_edicion_participante;

-- DROP TRIGGER IF EXISTS trg_modo_ingreso_updated_at;
-- DROP TABLE IF EXISTS modo_ingreso;

-- DROP TRIGGER IF EXISTS trg_tipo_actividad_updated_at;
-- DROP TABLE IF EXISTS tipo_actividad;
