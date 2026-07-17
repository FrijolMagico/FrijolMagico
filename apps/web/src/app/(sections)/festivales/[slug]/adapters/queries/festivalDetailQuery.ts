export const FESTIVAL_DETAIL_QUERY = `SELECT json_object(
  'edition_id', ee.id,
  'slug', ee.slug,
  'evento', json_object(
    'nombre', e.nombre,
    'slug', e.slug
  ),
  'edicion_nombre', ee.nombre,
  'numero_edicion', ee.numero_edicion,
  'poster_url', ee.poster_url,
  'dias', COALESCE((
    SELECT json_group_array(json_object(
      'fecha', eed.fecha,
      'hora_inicio', eed.hora_inicio,
      'hora_fin', eed.hora_fin,
      'modalidad', eed.modalidad,
      'lugar', CASE WHEN l.id IS NOT NULL
        THEN json_object('nombre', l.nombre, 'direccion', l.direccion)
        ELSE NULL END
    ))
    FROM evento_edicion_dia eed
    LEFT JOIN lugar l ON eed.lugar_id = l.id
    WHERE eed.evento_edicion_id = ee.id
    ORDER BY eed.fecha
  ), '[]'),
  'participantes', COALESCE((
    SELECT json_group_array(json_object(
      'pseudonimo', COALESCE(a.pseudonimo, ag.nombre, b.name),
      'disciplina_slug', d.slug,
'catalogo_slug', CASE WHEN ca.id IS NOT NULL THEN a.slug ELSE NULL END,
          'rrss', a.rrss,
          'avatar_url', CASE WHEN ca.id IS NOT NULL THEN (
            SELECT ai.imagen_url
            FROM artista_imagen ai
            WHERE ai.artista_id = a.id AND ai.tipo = 'avatar'
            ORDER BY ai.orden ASC
            LIMIT 1
          ) ELSE NULL END
    ))
    FROM participacion_edicion ped
    JOIN participacion_exposicion pexp ON pexp.participacion_id = ped.id
    JOIN disciplina d ON pexp.disciplina_id = d.id
    LEFT JOIN artista a ON ped.artista_id = a.id
    LEFT JOIN agrupacion ag ON ped.agrupacion_id = ag.id
    LEFT JOIN band b ON ped.banda_id = b.id
    LEFT JOIN catalogo_artista ca ON ca.artista_id = a.id
      AND ca.activo = 1 AND ca.deleted_at IS NULL
    WHERE ped.edicion_id = ee.id
    ORDER BY d.slug, COALESCE(a.pseudonimo, ag.nombre, b.name)
  ), '[]'),
  'actividades', COALESCE((
    SELECT json_group_array(json_object(
      'titulo', ac.titulo,
      'descripcion', ac.descripcion,
      'duracion_minutos', ac.duracion_minutos,
      'ubicacion', ac.ubicacion,
      'hora_inicio', ac.hora_inicio,
      'tipo', ta.slug,
      'fecha', (
        SELECT MIN(eed.fecha)
        FROM evento_edicion_dia eed
        WHERE eed.evento_edicion_id = ee.id
      ),
      'participante_pseudonimo', COALESCE(a2.pseudonimo, ag2.nombre, b2.name)
    ))
    FROM participacion_edicion ped2
    JOIN participacion_actividad pact ON pact.participacion_id = ped2.id
    LEFT JOIN actividad ac ON ac.participacion_actividad_id = pact.id
    JOIN tipo_actividad ta ON pact.tipo_actividad_id = ta.id
    LEFT JOIN artista a2 ON ped2.artista_id = a2.id
    LEFT JOIN agrupacion ag2 ON ped2.agrupacion_id = ag2.id
    LEFT JOIN band b2 ON ped2.banda_id = b2.id
    WHERE ped2.edicion_id = ee.id
    ORDER BY ac.hora_inicio
  ), '[]')
) as resultado
FROM evento e
JOIN evento_edicion ee ON e.id = ee.evento_id
WHERE ee.slug = ?
  AND ee.published = 1`
