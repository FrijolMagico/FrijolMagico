CREATE TABLE artista_pseudonimo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL REFERENCES artista(id) ON DELETE CASCADE,
    pseudonimo TEXT NOT NULL,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX uq_artist_pseudonym_id_artist ON artista_pseudonimo (id, artista_id);
--> statement-breakpoint
CREATE UNIQUE INDEX uq_artist_pseudonym_active_text ON artista_pseudonimo (pseudonimo) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX idx_artist_pseudonym_artist ON artista_pseudonimo (artista_id);
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_owner_immutable
BEFORE UPDATE OF artista_id ON artista_pseudonimo
FOR EACH ROW
WHEN NEW.artista_id IS NOT OLD.artista_id
BEGIN
    SELECT RAISE(ABORT, 'pseudonym ownership is immutable');
END;
--> statement-breakpoint
CREATE TABLE artista_pseudonimo_principal (
    artista_id INTEGER PRIMARY KEY REFERENCES artista(id) ON DELETE CASCADE,
    pseudonimo_id INTEGER NOT NULL UNIQUE,
    CONSTRAINT fk_artist_primary_pseudonym_owner
        FOREIGN KEY (pseudonimo_id, artista_id)
        REFERENCES artista_pseudonimo (id, artista_id) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO artista_pseudonimo (artista_id, pseudonimo, created_at, updated_at)
SELECT id, pseudonimo, created_at, updated_at FROM artista ORDER BY id;
--> statement-breakpoint
INSERT INTO artista_pseudonimo_principal (artista_id, pseudonimo_id)
SELECT p.artista_id, p.id
FROM artista_pseudonimo p
ORDER BY p.artista_id;
--> statement-breakpoint
ALTER TABLE catalogo_artista ADD COLUMN pseudonimo_id INTEGER REFERENCES artista_pseudonimo(id) ON DELETE RESTRICT;
--> statement-breakpoint
UPDATE catalogo_artista
SET pseudonimo_id = (SELECT p.id FROM artista_pseudonimo_principal pp JOIN artista_pseudonimo p ON p.id = pp.pseudonimo_id WHERE pp.artista_id = catalogo_artista.artista_id);
--> statement-breakpoint
CREATE TRIGGER trg_catalog_artist_pseudonym_owner_insert
BEFORE INSERT ON catalogo_artista
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'catalog pseudonym must belong to its artist')
    WHERE NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_catalog_artist_pseudonym_default
AFTER INSERT ON catalogo_artista
FOR EACH ROW
WHEN NEW.pseudonimo_id IS NULL
BEGIN
    UPDATE catalogo_artista
    SET pseudonimo_id = (SELECT pseudonimo_id FROM artista_pseudonimo_principal WHERE artista_id = NEW.artista_id)
    WHERE id = NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER trg_catalog_artist_pseudonym_owner_update
BEFORE UPDATE OF pseudonimo_id, artista_id ON catalogo_artista
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'catalog pseudonym must belong to its artist')
    WHERE NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM artista_pseudonimo p
        WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
    );
END;
--> statement-breakpoint
ALTER TABLE participacion_exposicion ADD COLUMN artista_id INTEGER REFERENCES artista(id) ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE participacion_exposicion ADD COLUMN pseudonimo_id INTEGER REFERENCES artista_pseudonimo(id) ON DELETE RESTRICT;
--> statement-breakpoint
UPDATE participacion_exposicion
SET artista_id = (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = participacion_exposicion.participacion_id),
    pseudonimo_id = (SELECT pp.pseudonimo_id FROM participacion_edicion pe JOIN artista_pseudonimo_principal pp ON pp.artista_id = pe.artista_id WHERE pe.id = participacion_exposicion.participacion_id)
WHERE EXISTS (SELECT 1 FROM participacion_edicion pe WHERE pe.id = participacion_exposicion.participacion_id AND pe.artista_id IS NOT NULL);
--> statement-breakpoint
ALTER TABLE participacion_actividad ADD COLUMN artista_id INTEGER REFERENCES artista(id) ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE participacion_actividad ADD COLUMN pseudonimo_id INTEGER REFERENCES artista_pseudonimo(id) ON DELETE RESTRICT;
--> statement-breakpoint
UPDATE participacion_actividad
SET artista_id = (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = participacion_actividad.participacion_id),
    pseudonimo_id = (SELECT pp.pseudonimo_id FROM participacion_edicion pe JOIN artista_pseudonimo_principal pp ON pp.artista_id = pe.artista_id WHERE pe.id = participacion_actividad.participacion_id)
WHERE EXISTS (SELECT 1 FROM participacion_edicion pe WHERE pe.id = participacion_actividad.participacion_id AND pe.artista_id IS NOT NULL);
--> statement-breakpoint
CREATE TRIGGER trg_exhibition_pseudonym_owner_insert
BEFORE INSERT ON participacion_exposicion
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'exhibition artist must match participation artist')
    WHERE NEW.artista_id IS NOT NULL
      AND NEW.artista_id IS NOT (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id);
    SELECT RAISE(ABORT, 'exhibition pseudonym must belong to its artist')
    WHERE (NEW.artista_id IS NULL) <> (NEW.pseudonimo_id IS NULL)
       OR (NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
           SELECT 1 FROM artista_pseudonimo p
           WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
       ));
END;
--> statement-breakpoint
CREATE TRIGGER trg_participation_artist_reassign_pseudonyms
AFTER UPDATE OF artista_id ON participacion_edicion
FOR EACH ROW
WHEN NEW.artista_id IS NOT OLD.artista_id
BEGIN
    UPDATE participacion_exposicion
    SET artista_id = NEW.artista_id,
        pseudonimo_id = (SELECT pseudonimo_id FROM artista_pseudonimo_principal WHERE artista_id = NEW.artista_id)
    WHERE participacion_id = NEW.id;
    UPDATE participacion_actividad
    SET artista_id = NEW.artista_id,
        pseudonimo_id = (SELECT pseudonimo_id FROM artista_pseudonimo_principal WHERE artista_id = NEW.artista_id)
    WHERE participacion_id = NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER trg_exhibition_pseudonym_default
AFTER INSERT ON participacion_exposicion
FOR EACH ROW
WHEN NEW.artista_id IS NULL AND EXISTS (
    SELECT 1 FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id AND pe.artista_id IS NOT NULL
)
BEGIN
    UPDATE participacion_exposicion
    SET artista_id = (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id),
        pseudonimo_id = (SELECT pp.pseudonimo_id FROM participacion_edicion pe JOIN artista_pseudonimo_principal pp ON pp.artista_id = pe.artista_id WHERE pe.id = NEW.participacion_id)
    WHERE id = NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER trg_exhibition_pseudonym_owner_update
BEFORE UPDATE OF participacion_id, artista_id, pseudonimo_id ON participacion_exposicion
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'exhibition artist must match participation artist')
    WHERE NEW.artista_id IS NOT (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id);
    SELECT RAISE(ABORT, 'exhibition pseudonym must belong to its artist')
    WHERE (NEW.artista_id IS NULL) <> (NEW.pseudonimo_id IS NULL)
       OR (NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
           SELECT 1 FROM artista_pseudonimo p
           WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
       ));
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_pseudonym_owner_insert
BEFORE INSERT ON participacion_actividad
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'activity artist must match participation artist')
    WHERE NEW.artista_id IS NOT NULL
      AND NEW.artista_id IS NOT (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id);
    SELECT RAISE(ABORT, 'activity pseudonym must belong to its artist')
    WHERE (NEW.artista_id IS NULL) <> (NEW.pseudonimo_id IS NULL)
       OR (NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
           SELECT 1 FROM artista_pseudonimo p
           WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
       ));
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_pseudonym_default
AFTER INSERT ON participacion_actividad
FOR EACH ROW
WHEN NEW.artista_id IS NULL AND EXISTS (
    SELECT 1 FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id AND pe.artista_id IS NOT NULL
)
BEGIN
    UPDATE participacion_actividad
    SET artista_id = (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id),
        pseudonimo_id = (SELECT pp.pseudonimo_id FROM participacion_edicion pe JOIN artista_pseudonimo_principal pp ON pp.artista_id = pe.artista_id WHERE pe.id = NEW.participacion_id)
    WHERE id = NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_pseudonym_owner_update
BEFORE UPDATE OF participacion_id, artista_id, pseudonimo_id ON participacion_actividad
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'activity artist must match participation artist')
    WHERE NEW.artista_id IS NOT (SELECT pe.artista_id FROM participacion_edicion pe WHERE pe.id = NEW.participacion_id);
    SELECT RAISE(ABORT, 'activity pseudonym must belong to its artist')
    WHERE (NEW.artista_id IS NULL) <> (NEW.pseudonimo_id IS NULL)
       OR (NEW.pseudonimo_id IS NOT NULL AND NOT EXISTS (
           SELECT 1 FROM artista_pseudonimo p
           WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
       ));
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_compat_insert
AFTER INSERT ON artista
FOR EACH ROW
BEGIN
    INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (NEW.id, NEW.pseudonimo);
    INSERT INTO artista_pseudonimo_principal (artista_id, pseudonimo_id)
    VALUES (NEW.id, last_insert_rowid());
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_compat_update
AFTER UPDATE OF pseudonimo ON artista
FOR EACH ROW
WHEN NEW.pseudonimo IS NOT OLD.pseudonimo
BEGIN
    UPDATE artista_pseudonimo
    SET pseudonimo = NEW.pseudonimo, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT pseudonimo_id FROM artista_pseudonimo_principal WHERE artista_id = NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_primary_delete
BEFORE DELETE ON artista_pseudonimo_principal
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM artista WHERE id = OLD.artista_id)
BEGIN
    SELECT RAISE(ABORT, 'artist must retain a primary pseudonym');
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_primary_active_insert
BEFORE INSERT ON artista_pseudonimo_principal
FOR EACH ROW
WHEN NOT EXISTS (
    SELECT 1 FROM artista_pseudonimo p
    WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
)
BEGIN
    SELECT RAISE(ABORT, 'primary pseudonym must be active and belong to its artist');
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_pseudonym_primary_active_update
BEFORE UPDATE OF pseudonimo_id, artista_id ON artista_pseudonimo_principal
FOR EACH ROW
WHEN NOT EXISTS (
    SELECT 1 FROM artista_pseudonimo p
    WHERE p.id = NEW.pseudonimo_id AND p.artista_id = NEW.artista_id AND p.deleted_at IS NULL
)
BEGIN
    SELECT RAISE(ABORT, 'primary pseudonym must be active and belong to its artist');
END;
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
 )
BEGIN
    SELECT RAISE(ABORT, 'cannot retire a referenced pseudonym');
END;
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
)
BEGIN
    SELECT RAISE(ABORT, 'cannot delete a referenced pseudonym');
END;
