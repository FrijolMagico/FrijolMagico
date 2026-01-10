-- Renombrar columna nombre a slug para consistencia con otras tablas de catálogo
ALTER TABLE tipo_actividad RENAME COLUMN nombre TO slug;
