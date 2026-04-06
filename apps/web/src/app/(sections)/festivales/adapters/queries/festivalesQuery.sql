SELECT json_object(
    'evento', json_object(
        'evento_id', e.id,
        'nombre', e.nombre,
        'slug', e.slug,
        'edicion', ee.numero_edicion,
        'edicion_nombre', ee.nombre,
        'poster_url', ee.poster_url,
        'dias', COALESCE((
            SELECT json_group_array(
                json_object(
                    'fecha', eed.fecha,
                    'hora_inicio', eed.hora_inicio,
                    'hora_fin', eed.hora_fin,
                    'modalidad', eed.modalidad,
                    'lugar', CASE
                        WHEN l.id IS NOT NULL THEN json_object(
                            'nombre', l.nombre,
                            'direccion', l.direccion
                        )
                        ELSE NULL
                    END
                )
            )
            FROM evento_edicion_dia eed
            LEFT JOIN lugar l ON eed.lugar_id = l.id
            WHERE eed.evento_edicion_id = ee.id
            ORDER BY eed.fecha
        ), '[]')
    ),
    'resumen', json_object(
        'total_participantes', json_object(
            'exponentes', (
                SELECT COUNT(DISTINCT ped.id)
                FROM participacion_exposicion pexp
                JOIN participacion_edicion ped ON ped.id = pexp.participacion_id
                WHERE ped.edicion_id = ee.id
            ),
            'talleres', (
                SELECT COUNT(DISTINCT ped.id)
                FROM participacion_actividad pact
                JOIN participacion_edicion ped ON ped.id = pact.participacion_id
                JOIN tipo_actividad ta ON pact.tipo_actividad_id = ta.id
                WHERE ped.edicion_id = ee.id
                  AND ta.slug = 'taller'
            ),
            'musica', (
                SELECT COUNT(DISTINCT ped.id)
                FROM participacion_actividad pact
                JOIN participacion_edicion ped ON ped.id = pact.participacion_id
                JOIN tipo_actividad ta ON pact.tipo_actividad_id = ta.id
                WHERE ped.edicion_id = ee.id
                  AND ta.slug = 'musica'
            )
        ),
        'por_disciplina', COALESCE((
            SELECT json_group_object(d.slug, cnt)
            FROM (
                SELECT pexp.disciplina_id, COUNT(DISTINCT ped.id) as cnt
                FROM participacion_exposicion pexp
                JOIN participacion_edicion ped ON ped.id = pexp.participacion_id
                WHERE ped.edicion_id = ee.id
                GROUP BY pexp.disciplina_id
            ) sub
            JOIN disciplina d ON sub.disciplina_id = d.id
        ), '{}')
    )
) as resultado
FROM evento e
JOIN evento_edicion ee ON e.id = ee.evento_id
ORDER BY (
    SELECT MIN(eed.fecha)
    FROM evento_edicion_dia eed
    WHERE eed.evento_edicion_id = ee.id
) DESC
