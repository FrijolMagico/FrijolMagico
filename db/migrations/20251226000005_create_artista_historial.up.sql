-- =============================================================================
-- ARTISTA HISTORIAL
-- =============================================================================
-- Tabla para tracking de cambios históricos en datos de artistas.
-- Solo registra campos modificados (no snapshots completos).
-- El valor actual siempre está en la tabla artista.
-- El historial se ordena por antigüedad (orden 1 = más antiguo).
-- =============================================================================

CREATE TABLE IF NOT EXISTS artista_historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,

    -- Campos trackeados (NULL = no cambió en este registro)
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,

    -- Ordenamiento por antigüedad (1 = más antiguo)
    orden INTEGER NOT NULL,

    -- Metadatos
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_artista_historial_artista
        FOREIGN KEY (artista_id) REFERENCES artista(id) ON DELETE CASCADE,
    CONSTRAINT uq_artista_historial_orden UNIQUE (artista_id, orden),
    CONSTRAINT chk_artista_historial_orden CHECK (orden > 0),
    CONSTRAINT chk_artista_historial_has_data CHECK (
        pseudonimo IS NOT NULL OR
        correo IS NOT NULL OR
        rrss IS NOT NULL OR
        ciudad IS NOT NULL OR
        pais IS NOT NULL
    )
);

-- Índices para queries comunes
CREATE INDEX idx_artista_historial_artista ON artista_historial(artista_id);
CREATE INDEX idx_artista_historial_pseudonimo ON artista_historial(pseudonimo) WHERE pseudonimo IS NOT NULL;
CREATE INDEX idx_artista_historial_orden ON artista_historial(artista_id, orden);
