SELECT
    a.pseudonimo,
    a.slug,
    ai.imagen_url
FROM catalogo_artista ac
LEFT JOIN artista a ON ac.artista_id = a.id
LEFT JOIN artista_imagen ai ON a.id = ai.artista_id
WHERE a.deleted_at IS null AND ac.destacado = true AND ac.activo = true
LIMIT 3;
