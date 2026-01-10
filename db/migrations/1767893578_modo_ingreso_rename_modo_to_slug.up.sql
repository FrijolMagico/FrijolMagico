-- Renombrar columna modo a slug para consistencia con otras tablas de catálogo
ALTER TABLE modo_ingreso RENAME COLUMN modo TO slug;
