-- =============================================================================
-- FRIJOL MÁGICO - SEED DATA
-- =============================================================================
-- System-required data (catalogs that FK's depend on)
-- This data is required for the application to function properly.
-- =============================================================================

-- =============================================================================
-- DISCIPLINAS
-- =============================================================================

INSERT OR IGNORE INTO disciplina (nombre) VALUES ('ilustracion');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('narrativa grafica');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('manualidades');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('fotografia');

-- =============================================================================
-- ARTISTA ESTADOS
-- =============================================================================

INSERT OR IGNORE INTO artista_estado (estado) VALUES ('desconocido');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('activo');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('inactivo');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('cancelado');

-- =============================================================================
-- MODOS DE INGRESO
-- =============================================================================

INSERT OR IGNORE INTO modo_ingreso (modo, descripcion) VALUES ('seleccion', 'Artista seleccionado mediante convocatoria abierta');
INSERT OR IGNORE INTO modo_ingreso (modo, descripcion) VALUES ('invitacion', 'Artista invitado directamente por la organización');

-- =============================================================================
-- TIPOS DE ACTIVIDAD
-- =============================================================================

INSERT OR IGNORE INTO tipo_actividad (nombre, descripcion) VALUES ('taller', 'Actividad práctica con participación de asistentes');
INSERT OR IGNORE INTO tipo_actividad (nombre, descripcion) VALUES ('charla', 'Presentación o conferencia');
INSERT OR IGNORE INTO tipo_actividad (nombre, descripcion) VALUES ('musica', 'Presentación musical en vivo');
