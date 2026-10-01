-- Presenter identity belongs to the activity, not edition participation.
-- Free-name and linked-artist forms are mutually exclusive; linked names resolve
-- through the selected active pseudonym so subsequent name changes stay current.
ALTER TABLE actividad ADD COLUMN presenter_nombre TEXT;
--> statement-breakpoint
ALTER TABLE actividad ADD COLUMN presenter_artista_id INTEGER REFERENCES artista(id) ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE actividad ADD COLUMN presenter_pseudonimo_id INTEGER REFERENCES artista_pseudonimo(id) ON DELETE RESTRICT;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_insert
BEFORE INSERT ON actividad
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'presenter is only allowed for talks')
    WHERE (NEW.presenter_nombre IS NOT NULL OR NEW.presenter_artista_id IS NOT NULL OR NEW.presenter_pseudonimo_id IS NOT NULL)
      AND NOT EXISTS (
          SELECT 1 FROM participacion_actividad pa
          JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
          WHERE pa.id = NEW.participacion_actividad_id AND ta.slug = 'charla'
      );
    SELECT RAISE(ABORT, 'presenter must be absent, a free name, or an artist pseudonym')
    WHERE (NEW.presenter_artista_id IS NULL) <> (NEW.presenter_pseudonimo_id IS NULL)
       OR (NEW.presenter_nombre IS NOT NULL AND (
           length(trim(NEW.presenter_nombre)) = 0
           OR NEW.presenter_artista_id IS NOT NULL
       ));
    SELECT RAISE(ABORT, 'presenter pseudonym must be active and belong to its artist')
    WHERE NEW.presenter_pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.presenter_pseudonimo_id
          AND p.artista_id = NEW.presenter_artista_id
          AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_update
BEFORE UPDATE OF participacion_actividad_id, presenter_nombre, presenter_artista_id, presenter_pseudonimo_id ON actividad
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'presenter is only allowed for talks')
    WHERE (NEW.presenter_nombre IS NOT NULL OR NEW.presenter_artista_id IS NOT NULL OR NEW.presenter_pseudonimo_id IS NOT NULL)
      AND NOT EXISTS (
          SELECT 1 FROM participacion_actividad pa
          JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
          WHERE pa.id = NEW.participacion_actividad_id AND ta.slug = 'charla'
      );
    SELECT RAISE(ABORT, 'presenter must be absent, a free name, or an artist pseudonym')
    WHERE (NEW.presenter_artista_id IS NULL) <> (NEW.presenter_pseudonimo_id IS NULL)
       OR (NEW.presenter_nombre IS NOT NULL AND (
           length(trim(NEW.presenter_nombre)) = 0
           OR NEW.presenter_artista_id IS NOT NULL
       ));
    SELECT RAISE(ABORT, 'presenter pseudonym must be active and belong to its artist')
    WHERE NEW.presenter_pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.presenter_pseudonimo_id
          AND p.artista_id = NEW.presenter_artista_id
          AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_type_update
BEFORE UPDATE OF tipo_actividad_id ON participacion_actividad
FOR EACH ROW
WHEN NEW.tipo_actividad_id IS NOT OLD.tipo_actividad_id
 AND EXISTS (
    SELECT 1 FROM actividad a
    WHERE a.participacion_actividad_id = NEW.id
      AND (a.presenter_nombre IS NOT NULL OR a.presenter_artista_id IS NOT NULL OR a.presenter_pseudonimo_id IS NOT NULL)
 )
 AND NOT EXISTS (SELECT 1 FROM tipo_actividad WHERE id = NEW.tipo_actividad_id AND slug = 'charla')
BEGIN
    SELECT RAISE(ABORT, 'clear presenter before changing activity from talk');
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_slug_update
BEFORE UPDATE OF slug ON tipo_actividad
FOR EACH ROW
WHEN NEW.slug <> 'charla'
 AND EXISTS (
    SELECT 1 FROM participacion_actividad pa
    JOIN actividad a ON a.participacion_actividad_id = pa.id
    WHERE pa.tipo_actividad_id = NEW.id
      AND (a.presenter_nombre IS NOT NULL OR a.presenter_artista_id IS NOT NULL OR a.presenter_pseudonimo_id IS NOT NULL)
 )
BEGIN
    SELECT RAISE(ABORT, 'clear presenter before changing activity type slug');
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_pseudonym_retire_guard
BEFORE UPDATE OF deleted_at ON artista_pseudonimo
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
 AND EXISTS (SELECT 1 FROM actividad a WHERE a.presenter_pseudonimo_id = OLD.id)
BEGIN
    SELECT RAISE(ABORT, 'cannot retire a referenced presenter pseudonym');
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_presenter_pseudonym_delete_guard
BEFORE DELETE ON artista_pseudonimo
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM actividad a WHERE a.presenter_pseudonimo_id = OLD.id)
BEGIN
    SELECT RAISE(ABORT, 'cannot delete a referenced presenter pseudonym');
END;
