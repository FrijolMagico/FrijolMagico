-- Additive: legacy activity time columns remain untouched. Rollback requires a
-- separately authorized migration to drop this table (and its triggers/indexes).
CREATE TABLE activity_occurrence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL REFERENCES actividad(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_activity_occurrence_date CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND julianday(date) IS NOT NULL AND date(julianday(date)) = date),
    CONSTRAINT chk_activity_occurrence_start_time CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]' AND substr(start_time, 1, 2) BETWEEN '00' AND '23'),
    CONSTRAINT chk_activity_occurrence_duration CHECK (typeof(duration_minutes) = 'integer' AND duration_minutes > 0 AND (CAST(substr(start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(start_time, 4, 2) AS INTEGER) + duration_minutes) <= 1440)
);
--> statement-breakpoint
CREATE UNIQUE INDEX uq_activity_occurrence_start ON activity_occurrence (activity_id, date, start_time);
--> statement-breakpoint
CREATE INDEX idx_activity_occurrence_date ON activity_occurrence (date, start_time);
--> statement-breakpoint
CREATE TRIGGER trg_activity_occurrence_insert BEFORE INSERT ON activity_occurrence
FOR EACH ROW BEGIN
    SELECT RAISE(ABORT, 'only workshops and talks can have occurrences')
    WHERE NOT EXISTS (
        SELECT 1 FROM actividad a
        JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
        JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
        WHERE a.id = NEW.activity_id AND ta.slug IN ('taller', 'charla')
    );
    SELECT RAISE(ABORT, 'activity occurrences overlap') WHERE EXISTS (
        SELECT 1 FROM activity_occurrence o
        WHERE o.activity_id = NEW.activity_id AND o.date = NEW.date
          AND (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER) + NEW.duration_minutes)
          AND (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER) + o.duration_minutes)
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_occurrence_update BEFORE UPDATE ON activity_occurrence
FOR EACH ROW BEGIN
    SELECT RAISE(ABORT, 'only workshops and talks can have occurrences')
    WHERE NOT EXISTS (
        SELECT 1 FROM actividad a
        JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
        JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
        WHERE a.id = NEW.activity_id AND ta.slug IN ('taller', 'charla')
    );
    SELECT RAISE(ABORT, 'activity occurrences overlap') WHERE EXISTS (
        SELECT 1 FROM activity_occurrence o
        WHERE o.id <> OLD.id AND o.activity_id = NEW.activity_id AND o.date = NEW.date
          AND (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER) + NEW.duration_minutes)
          AND (CAST(substr(NEW.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(NEW.start_time, 4, 2) AS INTEGER))
              < (CAST(substr(o.start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(o.start_time, 4, 2) AS INTEGER) + o.duration_minutes)
    );
END;
--> statement-breakpoint
-- Reassigning an activity to an unschedulable participation clears its sessions.
CREATE TRIGGER trg_activity_occurrence_clear_on_participation_change
AFTER UPDATE OF participacion_actividad_id ON actividad
FOR EACH ROW
WHEN NOT EXISTS (
    SELECT 1 FROM participacion_actividad pa
    JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id
    WHERE pa.id = NEW.participacion_actividad_id AND ta.slug IN ('taller', 'charla')
)
BEGIN
    DELETE FROM activity_occurrence WHERE activity_id = NEW.id;
END;
--> statement-breakpoint
-- Remove sessions when an activity ceases to be a workshop or talk.
CREATE TRIGGER trg_activity_occurrence_clear_on_type_change
AFTER UPDATE OF tipo_actividad_id ON participacion_actividad
FOR EACH ROW
WHEN NOT EXISTS (SELECT 1 FROM tipo_actividad WHERE id = NEW.tipo_actividad_id AND slug IN ('taller', 'charla'))
BEGIN
    DELETE FROM activity_occurrence WHERE activity_id IN (
        SELECT id FROM actividad WHERE participacion_actividad_id = NEW.id
    );
END;
--> statement-breakpoint
CREATE TRIGGER trg_activity_occurrence_clear_on_slug_change
AFTER UPDATE OF slug ON tipo_actividad
FOR EACH ROW
WHEN NEW.slug NOT IN ('taller', 'charla')
BEGIN
    DELETE FROM activity_occurrence WHERE activity_id IN (
        SELECT a.id FROM actividad a
        JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
        WHERE pa.tipo_actividad_id = NEW.id
    );
END;
--> statement-breakpoint
-- Only an unambiguous single-day workshop with a valid, non-crossing wall-time is inferred.
INSERT INTO activity_occurrence (activity_id, date, start_time, duration_minutes)
SELECT a.id, MIN(d.fecha), a.hora_inicio, a.duracion_minutos
FROM actividad a
JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
JOIN tipo_actividad ta ON ta.id = pa.tipo_actividad_id AND ta.slug = 'taller'
JOIN participacion_edicion pe ON pe.id = pa.participacion_id
JOIN evento_edicion_dia d ON d.evento_edicion_id = pe.edicion_id
WHERE a.hora_inicio GLOB '[0-2][0-9]:[0-5][0-9]'
  AND substr(a.hora_inicio, 1, 2) BETWEEN '00' AND '23'
  AND typeof(a.duracion_minutos) = 'integer' AND a.duracion_minutos > 0
  AND (CAST(substr(a.hora_inicio, 1, 2) AS INTEGER) * 60 + CAST(substr(a.hora_inicio, 4, 2) AS INTEGER) + a.duracion_minutos) <= 1440
  AND d.fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  AND julianday(d.fecha) IS NOT NULL
  AND date(julianday(d.fecha)) = d.fecha
GROUP BY a.id
HAVING (SELECT COUNT(*) FROM evento_edicion_dia WHERE evento_edicion_id = pe.edicion_id) = 1;
