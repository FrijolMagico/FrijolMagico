ALTER TABLE evento_edicion ADD COLUMN published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1));
--> statement-breakpoint
UPDATE evento_edicion SET published = 1;
