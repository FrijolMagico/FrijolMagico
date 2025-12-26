-- =============================================================================
-- AGREGAR SLUGS A EVENTO Y EVENTO_EDICION
-- =============================================================================
-- - evento: agregar slug para identificar eventos en URLs
-- - evento_edicion: agregar slug (lowercase de numero_edicion) y constraints
-- =============================================================================

-- =============================================================================
-- 1. AGREGAR SLUG A EVENTO (si no existe)
-- =============================================================================

-- Nota: SQLite no soporta ADD COLUMN IF NOT EXISTS, pero ignora si ya existe
-- en algunas versiones. Usamos una estrategia segura.

-- Poblar slug para eventos existentes (idempotente)
UPDATE evento SET slug = 'frijol-magico' 
WHERE (nombre LIKE '%Frijol%' OR nombre LIKE '%frijol%') AND slug IS NULL;

-- =============================================================================
-- 2. AGREGAR SLUG Y CONSTRAINTS A EVENTO_EDICION
-- =============================================================================

-- Poblar slug con lowercase de numero_edicion (idempotente)
UPDATE evento_edicion SET slug = LOWER(numero_edicion) WHERE slug IS NULL;

-- Eliminar índice antiguo (solo numero_edicion) y crear el compuesto
DROP INDEX IF EXISTS idx_evento_edicion_numero;

CREATE UNIQUE INDEX idx_evento_edicion_numero 
ON evento_edicion (evento_id, numero_edicion);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_edicion_slug 
ON evento_edicion (evento_id, slug);
