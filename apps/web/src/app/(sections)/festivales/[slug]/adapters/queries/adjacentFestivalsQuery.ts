export const ADJACENT_FESTIVALS_QUERY = `
WITH edition_ranked AS (
  SELECT
    ee.slug,
    ee.numero_edicion,
    ee.nombre AS edicion_nombre,
    e.nombre AS evento_nombre,
    ROW_NUMBER() OVER (ORDER BY MIN(eed.fecha) ASC) AS pos
  FROM evento_edicion ee
  JOIN evento e ON e.id = ee.evento_id
  JOIN evento_edicion_dia eed ON eed.evento_edicion_id = ee.id
  GROUP BY ee.id
),
current_pos AS (
  SELECT pos FROM edition_ranked WHERE slug = ?
)
SELECT 'prev' AS direction, slug, numero_edicion, edicion_nombre, evento_nombre
FROM edition_ranked WHERE pos = (SELECT pos FROM current_pos) - 1

UNION ALL

SELECT 'next' AS direction, slug, numero_edicion, edicion_nombre, evento_nombre
FROM edition_ranked WHERE pos = (SELECT pos FROM current_pos) + 1
`
