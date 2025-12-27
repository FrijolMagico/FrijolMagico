-- Rollback: Restaurar descripcion en artista desde catalogo_artista

-- 1. Restaurar columna en artista
ALTER TABLE artista ADD COLUMN descripcion TEXT;

-- 2. Copiar datos de vuelta
UPDATE artista 
SET descripcion = (
    SELECT descripcion FROM catalogo_artista 
    WHERE catalogo_artista.artista_id = artista.id
);

-- 3. Eliminar de catalogo_artista
ALTER TABLE catalogo_artista DROP COLUMN descripcion;
