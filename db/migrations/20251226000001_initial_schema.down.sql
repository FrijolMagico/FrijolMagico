-- =============================================================================
-- ROLLBACK: INITIAL DATABASE SCHEMA
-- =============================================================================
-- Drops all tables and triggers in reverse dependency order
-- =============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trg_organizacion_updated_at;
DROP TRIGGER IF EXISTS trg_organizacion_equipo_updated_at;
DROP TRIGGER IF EXISTS trg_evento_updated_at;
DROP TRIGGER IF EXISTS trg_evento_edicion_updated_at;
DROP TRIGGER IF EXISTS trg_lugar_updated_at;
DROP TRIGGER IF EXISTS trg_evento_edicion_dia_updated_at;
DROP TRIGGER IF EXISTS trg_disciplina_updated_at;
DROP TRIGGER IF EXISTS trg_artista_updated_at;
DROP TRIGGER IF EXISTS trg_artista_imagen_updated_at;
DROP TRIGGER IF EXISTS trg_evento_edicion_postulacion_updated_at;
DROP TRIGGER IF EXISTS trg_agrupacion_updated_at;
DROP TRIGGER IF EXISTS trg_agrupacion_miembro_updated_at;
DROP TRIGGER IF EXISTS trg_evento_edicion_participante_updated_at;
DROP TRIGGER IF EXISTS trg_artista_invitado_updated_at;
DROP TRIGGER IF EXISTS trg_evento_edicion_invitado_updated_at;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS evento_edicion_snapshot;
DROP TABLE IF EXISTS evento_edicion_metrica;
DROP TABLE IF EXISTS evento_edicion_invitado;
DROP TABLE IF EXISTS artista_invitado;
DROP TABLE IF EXISTS evento_edicion_participante;
DROP TABLE IF EXISTS agrupacion_miembro;
DROP TABLE IF EXISTS agrupacion;
DROP TABLE IF EXISTS evento_edicion_postulacion;
DROP TABLE IF EXISTS artista_imagen;
DROP TABLE IF EXISTS artista;
DROP TABLE IF EXISTS disciplina;
DROP TABLE IF EXISTS evento_edicion_dia;
DROP TABLE IF EXISTS lugar;
DROP TABLE IF EXISTS evento_edicion;
DROP TABLE IF EXISTS evento;
DROP TABLE IF EXISTS organizacion_equipo;
DROP TABLE IF EXISTS organizacion;
