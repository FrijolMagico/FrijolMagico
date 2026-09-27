CREATE TABLE activity_registration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participation_activity_id INTEGER NOT NULL UNIQUE REFERENCES participacion_actividad(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_activity_registration_https CHECK (url LIKE 'https://_%' COLLATE BINARY AND substr(url, 1, 8) = 'https://'),
    CONSTRAINT chk_activity_registration_start CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', julianday(start_at)) IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%fZ', julianday(start_at)) = start_at),
    CONSTRAINT chk_activity_registration_end CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', julianday(end_at)) IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%fZ', julianday(end_at)) = end_at),
    CONSTRAINT chk_activity_registration_window CHECK (end_at > start_at)
);
--> statement-breakpoint
CREATE TRIGGER trg_activity_registration_updated_at
AFTER UPDATE ON activity_registration
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE activity_registration SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_registration_reject_music_insert
BEFORE INSERT ON activity_registration
FOR EACH ROW
WHEN EXISTS (
    SELECT 1 FROM participacion_actividad pa
    JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
    WHERE pa.id = NEW.participation_activity_id AND ta.slug = 'musica'
)
BEGIN
    SELECT RAISE(ABORT, 'music activities cannot have registration');
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_registration_reject_music_update
BEFORE UPDATE OF participation_activity_id ON activity_registration
FOR EACH ROW
WHEN EXISTS (
    SELECT 1 FROM participacion_actividad pa
    JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
    WHERE pa.id = NEW.participation_activity_id AND ta.slug = 'musica'
)
BEGIN
    SELECT RAISE(ABORT, 'music activities cannot have registration');
END;
--> statement-breakpoint
CREATE TRIGGER trg_participation_activity_clear_registration_on_music
AFTER UPDATE OF tipo_actividad_id ON participacion_actividad
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM tipo_actividad WHERE id = NEW.tipo_actividad_id AND slug = 'musica')
BEGIN
    DELETE FROM activity_registration WHERE participation_activity_id = NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_type_clear_registration_on_music_slug
AFTER UPDATE OF slug ON tipo_actividad
FOR EACH ROW
WHEN NEW.slug = 'musica'
BEGIN
    DELETE FROM activity_registration WHERE participation_activity_id IN (
        SELECT id FROM participacion_actividad WHERE tipo_actividad_id = NEW.id
    );
END;
