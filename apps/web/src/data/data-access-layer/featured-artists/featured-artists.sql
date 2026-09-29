SELECT
    primary_pseudonym.pseudonimo AS pseudonimo,
    a.slug,
    a.rrss,
    ai.imagen_url
FROM catalogo_artista ac
LEFT JOIN artista a ON ac.artista_id = a.id
LEFT JOIN artista_pseudonimo_principal app ON app.artista_id = a.id
LEFT JOIN artista_pseudonimo primary_pseudonym ON primary_pseudonym.id = app.pseudonimo_id
LEFT JOIN artista_imagen ai ON a.id = ai.artista_id
WHERE a.deleted_at IS null AND ac.destacado = true AND ac.activo = true
LIMIT 3;
