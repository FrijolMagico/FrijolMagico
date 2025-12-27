-- Migración: Mover descripcion de artista a catalogo_artista
-- Razón: La descripción es un dato de presentación del catálogo, no del artista

-- 1. Agregar columna a catalogo_artista
ALTER TABLE catalogo_artista ADD COLUMN descripcion TEXT;

-- 2. Copiar datos desde artista
UPDATE catalogo_artista 
SET descripcion = (
    SELECT descripcion FROM artista 
    WHERE artista.id = catalogo_artista.artista_id
);

-- 3. Eliminar columna de artista
ALTER TABLE artista DROP COLUMN descripcion;
