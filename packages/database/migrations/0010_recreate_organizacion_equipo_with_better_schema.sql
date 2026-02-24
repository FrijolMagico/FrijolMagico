-- Custom SQL migration file, put your code below! --

DROP TABLE IF EXISTS organizacion_equipo;
--> statement-breakpoint

-- organization_member
CREATE TABLE IF NOT EXISTS organization_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    rut TEXT UNIQUE,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    rrss TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_member_organization FOREIGN KEY (organization_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
);
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_organizacion_equipo_updated_at;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_organization_member_updated_at;
--> statement-breakpoint

CREATE TRIGGER trg_organization_member_updated_at
AFTER UPDATE ON organization_member
FOR EACH ROW
WHEN new.updated_at = old.updated_at
BEGIN
    UPDATE organization_member SET updated_at = CURRENT_TIMESTAMP
    WHERE id = new.id AND updated_at = old.updated_at;
END;
