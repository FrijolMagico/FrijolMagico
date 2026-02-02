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

INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (1, 'desconocido');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (2, 'activo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (3, 'inactivo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (4, 'vetado');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (5, 'cancelado');

-- =============================================================================
-- MODOS DE INGRESO
-- =============================================================================

INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'seleccion', 'Artista seleccionado mediante convocatoria abierta'
);
INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'invitacion', 'Artista invitado directamente por la organización'
);
INSERT OR IGNORE INTO modo_ingreso (id, slug, descripcion) VALUES (
    3, 'suplencia', 'Artista agregado desde la lista de suplentes'
);

-- =============================================================================
-- TIPOS DE ACTIVIDAD
-- =============================================================================

INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'taller', 'Actividad práctica con participación de asistentes'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'charla', 'Presentación o conferencia'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'musica', 'Presentación musical en vivo'
);
