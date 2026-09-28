-- Keep the activity-wide registration window and the legacy URL column intact.
-- Occurrence URLs are nullable so legacy activities without occurrences retain
-- their URL until an administrator assigns dates.
ALTER TABLE activity_occurrence ADD COLUMN url TEXT CHECK (
    url IS NULL OR (url LIKE 'https://_%' COLLATE BINARY AND substr(url, 1, 8) = 'https://')
);
--> statement-breakpoint
-- Allocate the existing URL to every occurrence without changing occurrence IDs.
UPDATE activity_occurrence
SET url = (
    SELECT ar.url
    FROM actividad a
    JOIN activity_registration ar
      ON ar.participation_activity_id = a.participacion_actividad_id
    WHERE a.id = activity_occurrence.activity_id
)
WHERE EXISTS (
    SELECT 1
    FROM actividad a
    JOIN activity_registration ar
      ON ar.participation_activity_id = a.participacion_actividad_id
    WHERE a.id = activity_occurrence.activity_id
);
--> statement-breakpoint
-- Replace the original workshop/talk-only guards; music can now own occurrences.
DROP TRIGGER trg_activity_occurrence_insert;
--> statement-breakpoint
DROP TRIGGER trg_activity_occurrence_update;
--> statement-breakpoint
CREATE TRIGGER trg_activity_occurrence_insert BEFORE INSERT ON activity_occurrence
FOR EACH ROW BEGIN
    SELECT RAISE(ABORT, 'only workshops, talks and music can have occurrences')
    WHERE NOT EXISTS (
        SELECT 1 FROM actividad a
        JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
        JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
        WHERE a.id = NEW.activity_id AND ta.slug IN ('taller', 'charla', 'musica')
    );
    SELECT RAISE(ABORT, 'activity occurrences overlap') WHERE EXISTS (
        SELECT 1 FROM activity_occurrence o
        WHERE o.activity_id = NEW.activity_id AND o.date = NEW.date
          AND NEW.start_time IS NOT NULL AND NEW.duration_minutes IS NOT NULL
          AND o.start_time IS NOT NULL AND o.duration_minutes IS NOT NULL
          AND (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER) + NEW.duration_minutes)
          AND (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER) + o.duration_minutes)
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_occurrence_update BEFORE UPDATE ON activity_occurrence
FOR EACH ROW BEGIN
    SELECT RAISE(ABORT, 'only workshops, talks and music can have occurrences')
    WHERE NOT EXISTS (
        SELECT 1 FROM actividad a
        JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
        JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
        WHERE a.id = NEW.activity_id AND ta.slug IN ('taller', 'charla', 'musica')
    );
    SELECT RAISE(ABORT, 'activity occurrences overlap') WHERE EXISTS (
        SELECT 1 FROM activity_occurrence o
        WHERE o.id <> OLD.id AND o.activity_id = NEW.activity_id AND o.date = NEW.date
          AND NEW.start_time IS NOT NULL AND NEW.duration_minutes IS NOT NULL
          AND o.start_time IS NOT NULL AND o.duration_minutes IS NOT NULL
          AND (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER) + NEW.duration_minutes)
          AND (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER) + o.duration_minutes)
    );
END;
--> statement-breakpoint
-- Type/participation transitions must never silently erase occurrence data.
DROP TRIGGER trg_activity_occurrence_clear_on_participation_change;
--> statement-breakpoint
DROP TRIGGER trg_activity_occurrence_clear_on_type_change;
--> statement-breakpoint
DROP TRIGGER trg_activity_occurrence_clear_on_slug_change;
