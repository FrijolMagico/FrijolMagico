-- Migration: Convert auth.user timestamp columns from TEXT to INTEGER
-- Changes createdAt and updatedAt from ISO strings to Unix timestamps
-- Since there are no critical auth data, we clean dependent tables and recreate user

-- Clean dependent tables first (to avoid foreign key issues)
DELETE FROM session;
--> statement-breakpoint
DELETE FROM account;
--> statement-breakpoint

-- Drop old user table
DROP TABLE user;
--> statement-breakpoint

-- Create new user table with correct timestamp types
CREATE TABLE user (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT false NOT NULL,
    name TEXT,
    image TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint

-- Recreate index
CREATE INDEX idx_user_email ON user(email);
