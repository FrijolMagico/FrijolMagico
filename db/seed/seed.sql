-- =============================================================================
-- FRIJOL MÁGICO - SEED DATA
-- =============================================================================
-- System-required data (catalogs that FK's depend on)
-- This data is required for the application to function properly.
-- =============================================================================

-- =============================================================================
-- DISCIPLINAS
-- =============================================================================

INSERT OR IGNORE INTO disciplina (slug) VALUES ('ilustracion');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('narrativa-grafica');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('manualidades');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('fotografia');

-- =============================================================================
-- ARTISTA ESTADOS
-- =============================================================================

INSERT OR IGNORE INTO artista_estado (slug) VALUES ('desconocido');
INSERT OR IGNORE INTO artista_estado (slug) VALUES ('activo');
INSERT OR IGNORE INTO artista_estado (slug) VALUES ('inactivo');
INSERT OR IGNORE INTO artista_estado (slug) VALUES ('cancelado');

-- =============================================================================
-- MODOS DE INGRESO
-- =============================================================================

INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES ('seleccion', 'Artista seleccionado mediante convocatoria abierta');
INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES ('invitacion', 'Artista invitado directamente por la organización');

-- =============================================================================
-- TIPOS DE ACTIVIDAD
-- =============================================================================

INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES ('taller', 'Actividad práctica con participación de asistentes');
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES ('charla', 'Presentación o conferencia');
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES ('musica', 'Presentación musical en vivo');
