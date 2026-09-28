CREATE TABLE artista_slug_alias (
    slug TEXT PRIMARY KEY NOT NULL,
    artista_id INTEGER NOT NULL REFERENCES artista(id) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX idx_artist_slug_alias_artist ON artista_slug_alias (artista_id);
--> statement-breakpoint
CREATE TRIGGER trg_artist_slug_alias_insert_guard
BEFORE INSERT ON artista_slug_alias
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'artist slug alias collides with canonical slug')
    WHERE EXISTS (SELECT 1 FROM artista WHERE slug = NEW.slug);
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_slug_alias_update_guard
BEFORE UPDATE OF slug, artista_id ON artista_slug_alias
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'artist slug alias collides with canonical slug')
    WHERE EXISTS (SELECT 1 FROM artista WHERE slug = NEW.slug);
END;
--> statement-breakpoint
CREATE TRIGGER trg_artist_canonical_slug_update_guard
BEFORE UPDATE OF slug ON artista
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'canonical artist slug collides with alias')
    WHERE EXISTS (SELECT 1 FROM artista_slug_alias WHERE slug = NEW.slug);
END;
