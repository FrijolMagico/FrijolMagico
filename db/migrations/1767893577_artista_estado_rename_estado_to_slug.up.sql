-- Renombrar columna estado a slug para consistencia con otras tablas de catálogo
ALTER TABLE artista_estado RENAME COLUMN estado TO slug;
