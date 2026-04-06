SELECT json_object(
  'id', a.id,
  'name', COALESCE(a.pseudonimo, a.nombre),
  'slug', a.slug,
  'email', a.correo,
  'rrss', a.rrss,
  'city', a.ciudad,
  'country', a.pais,
  'bio', ca.descripcion,
  'orden', ca.orden,
  'destacado', ca.destacado,
  'avatar', (
    SELECT ai.imagen_url
    FROM artista_imagen ai
    WHERE ai.artista_id = a.id AND ai.tipo = 'avatar'
    ORDER BY ai.orden ASC
    LIMIT 1
  ),
  'category', (
    SELECT sub.slug
    FROM (
      SELECT
        d.slug,
        MAX(eed.fecha) as last_fecha
      FROM participacion_exposicion pexp
      JOIN participacion_edicion ped ON pexp.participacion_id = ped.id
      JOIN disciplina d ON pexp.disciplina_id = d.id
      JOIN evento_edicion ee ON ped.edicion_id = ee.id
      LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
      WHERE ped.artista_id = a.id
      GROUP BY pexp.id, d.slug

      UNION ALL

      SELECT
        d.slug,
        MAX(eed.fecha) as last_fecha
      FROM agrupacion_artista aa
      JOIN participacion_edicion ped ON ped.agrupacion_id = aa.agrupacion_id
      JOIN participacion_exposicion pexp ON pexp.participacion_id = ped.id
      JOIN disciplina d ON pexp.disciplina_id = d.id
      JOIN evento_edicion ee ON ped.edicion_id = ee.id
      LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
      WHERE aa.artista_id = a.id
      GROUP BY pexp.id, d.slug
    ) sub
    ORDER BY sub.last_fecha DESC
    LIMIT 1
  ),
  'collective', (
    SELECT ag.nombre
    FROM agrupacion_artista aa
    JOIN agrupacion ag ON aa.agrupacion_id = ag.id
    WHERE aa.artista_id = a.id AND aa.activo = 1
    LIMIT 1
  ),
  'editions', COALESCE((
    SELECT json_group_array(
      json_object(
        'edicion', sub.numero_edicion,
        'evento', sub.evento_nombre,
        'año', sub.año,
        'via_agrupacion', sub.via_agrupacion
      )
    )
    FROM (
      SELECT DISTINCT
        ee.numero_edicion,
        ev.nombre as evento_nombre,
        SUBSTR(MIN(eed.fecha), 1, 4) as año,
        NULL as via_agrupacion
      FROM participacion_edicion ped
      JOIN evento_edicion ee ON ped.edicion_id = ee.id
      JOIN evento ev ON ee.evento_id = ev.id
      LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
      WHERE ped.artista_id = a.id
      GROUP BY ee.id, ee.numero_edicion, ev.nombre

      UNION ALL

      SELECT DISTINCT
        ee.numero_edicion,
        ev.nombre as evento_nombre,
        SUBSTR(MIN(eed.fecha), 1, 4) as año,
        ag.nombre as via_agrupacion
      FROM agrupacion_artista aa
      JOIN participacion_edicion ped ON ped.agrupacion_id = aa.agrupacion_id
      JOIN agrupacion ag ON aa.agrupacion_id = ag.id
      JOIN evento_edicion ee ON ped.edicion_id = ee.id
      JOIN evento ev ON ee.evento_id = ev.id
      LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
      WHERE aa.artista_id = a.id
      GROUP BY ee.id, ee.numero_edicion, ev.nombre, ag.nombre
    ) sub
  ), '[]')
) as resultado
FROM catalogo_artista ca
JOIN artista a ON ca.artista_id = a.id
WHERE ca.activo = 1
ORDER BY ca.orden ASC
