-- Renombrar columna nombre a slug para claridad semántica
-- El campo actúa como identificador único (slug) y el label se maneja en el frontend
ALTER TABLE disciplina RENAME COLUMN nombre TO slug;
