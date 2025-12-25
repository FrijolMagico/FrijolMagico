-- =============================================================================
-- FRIJOL MÁGICO - DATABASE INDEXES
-- =============================================================================
-- Performance optimization indexes for common query patterns
-- =============================================================================

-- =============================================================================
-- EVENTOS
-- =============================================================================

CREATE INDEX idx_evento_edicion_evento
ON evento_edicion (evento_id)
;

CREATE INDEX idx_evento_edicion_dia_edicion
ON evento_edicion_dia (evento_edicion_id)
;

CREATE INDEX idx_evento_edicion_dia_fecha
ON evento_edicion_dia (fecha)
;

CREATE INDEX idx_evento_edicion_dia_lugar_dia
ON evento_edicion_dia_lugar (evento_edicion_dia_id)
;

-- =============================================================================
-- PARTICIPANTES
-- =============================================================================

CREATE INDEX idx_participante_evento_edicion
ON evento_edicion_participante (evento_edicion_id)
;

CREATE INDEX idx_participante_artista
ON evento_edicion_participante (artista_id)
;

CREATE INDEX idx_participante_estado
ON evento_edicion_participante (estado)
;

-- =============================================================================
-- AGRUPACIONES
-- =============================================================================

CREATE INDEX idx_agrupacion_miembro_evento_edicion
ON agrupacion_miembro (evento_edicion_id)
;

CREATE INDEX idx_agrupacion_miembro_agrupacion
ON agrupacion_miembro (agrupacion_id)
;

-- =============================================================================
-- INVITADOS
-- =============================================================================

CREATE INDEX idx_evento_edicion_invitado_evento_edicion
ON evento_edicion_invitado (evento_edicion_id)
;

-- =============================================================================
-- MÉTRICAS Y SNAPSHOTS
-- =============================================================================

CREATE INDEX idx_evento_edicion_metrica_evento_edicion
ON evento_edicion_metrica (evento_edicion_id)
;

CREATE INDEX idx_evento_edicion_metrica_fecha
ON evento_edicion_metrica (fecha_registro)
;

CREATE INDEX idx_evento_edicion_snapshot_evento_edicion
ON evento_edicion_snapshot (evento_edicion_id)
;
