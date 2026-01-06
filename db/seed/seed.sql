-- =============================================================================
-- FRIJOL MÁGICO - SEED DATA
-- =============================================================================
-- System-required data (catalogs that FK's depend on)
-- This data is required for the application to function properly.
-- =============================================================================

-- =============================================================================
-- DISCIPLINAS
-- =============================================================================

INSERT OR IGNORE INTO disciplina (nombre) VALUES ('Ilustración');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('Narrativa gráfica');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('Manualidades');
INSERT OR IGNORE INTO disciplina (nombre) VALUES ('Fotografía');

-- =============================================================================
-- ARTISTA ESTADOS
-- =============================================================================

INSERT OR IGNORE INTO artista_estado (estado) VALUES ('desconocido');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('activo');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('inactivo');
INSERT OR IGNORE INTO artista_estado (estado) VALUES ('cancelado');
