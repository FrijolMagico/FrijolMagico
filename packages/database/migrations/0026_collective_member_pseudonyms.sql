ALTER TABLE agrupacion_artista ADD COLUMN pseudonimo_id INTEGER REFERENCES artista_pseudonimo(id) ON DELETE RESTRICT;
--> statement-breakpoint
UPDATE agrupacion_artista
SET pseudonimo_id = (
    SELECT pp.pseudonimo_id
    FROM artista_pseudonimo_principal pp
    WHERE pp.artista_id = agrupacion_artista.artista_id
);
--> statement-breakpoint
CREATE TRIGGER trg_collective_artist_pseudonym_owner_insert
BEFORE INSERT ON agrupacion_artista
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'collective member pseudonym must belong to its artist')
    WHERE NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.pseudonimo_id
          AND p.artista_id = NEW.artista_id
          AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_collective_artist_pseudonym_owner_update
BEFORE UPDATE OF pseudonimo_id, artista_id ON agrupacion_artista
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'collective member pseudonym must belong to its artist')
    WHERE NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.pseudonimo_id
          AND p.artista_id = NEW.artista_id
          AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
DROP TRIGGER trg_artist_pseudonym_retire_guard;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_retire_guard
BEFORE UPDATE OF deleted_at ON artista_pseudonimo
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
 AND (
    EXISTS (SELECT 1 FROM artista_pseudonimo_principal pp WHERE pp.pseudonimo_id = OLD.id)
    OR EXISTS (SELECT 1 FROM catalogo_artista ca WHERE ca.pseudonimo_id = OLD.id)
    OR EXISTS (SELECT 1 FROM participacion_exposicion pe WHERE pe.pseudonimo_id = OLD.id)
    OR EXISTS (SELECT 1 FROM participacion_actividad pa WHERE pa.pseudonimo_id = OLD.id)
    OR EXISTS (SELECT 1 FROM agrupacion_artista aa WHERE aa.pseudonimo_id = OLD.id)
 )
BEGIN
    SELECT RAISE(ABORT, 'cannot retire a referenced pseudonym');
END;
--> statement-breakpoint
DROP TRIGGER trg_artist_pseudonym_delete_guard;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_delete_guard
BEFORE DELETE ON artista_pseudonimo
FOR EACH ROW
WHEN EXISTS (
    SELECT 1 FROM artista_pseudonimo_principal pp WHERE pp.pseudonimo_id = OLD.id
) OR EXISTS (
    SELECT 1 FROM catalogo_artista ca WHERE ca.pseudonimo_id = OLD.id
) OR EXISTS (
    SELECT 1 FROM participacion_exposicion pe WHERE pe.pseudonimo_id = OLD.id
) OR EXISTS (
    SELECT 1 FROM participacion_actividad pa WHERE pa.pseudonimo_id = OLD.id
) OR EXISTS (
    SELECT 1 FROM agrupacion_artista aa WHERE aa.pseudonimo_id = OLD.id
)
BEGIN
    SELECT RAISE(ABORT, 'cannot delete a referenced pseudonym');
END;
