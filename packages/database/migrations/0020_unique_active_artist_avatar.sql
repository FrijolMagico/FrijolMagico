WITH ranked_active_avatars AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY artista_id
      ORDER BY created_at DESC, id DESC
    ) AS rank
  FROM artista_imagen
  WHERE tipo = 'avatar' AND deleted_at IS NULL
)
UPDATE artista_imagen
SET deleted_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT id
  FROM ranked_active_avatars
  WHERE ranked_active_avatars.rank > 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX uq_artist_image_active_avatar
ON artista_imagen (artista_id)
WHERE tipo = 'avatar' AND deleted_at IS NULL;
