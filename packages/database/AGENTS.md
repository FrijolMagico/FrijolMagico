# Database Package

Drizzle ORM + Turso (libSQL) database package.

## Tech Stack

- **ORM:** Drizzle ORM
- **Database:** Turso (libSQL) - SQLite for production, local file for dev
- **Client:** @libsql/client
- **Schema:** TypeScript with drizzle-orm/sqlite-core

## Commands

```bash
bun run seed
bun run dev
bun run prod
bun run migrate
bun run new <name>
bun run lint
bun run type-check
```

## Architecture

### Package Exports

```typescript
import { db } from '@frijolmagico/database/orm'
import { executeQuery } from '@frijolmagico/database/client'
import { schema } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { loadSql } from '@frijolmagico/database/sql'
```

### Directory Structure

```
src/
├── client.ts                  # Raw SQL client (Turso/libSQL)
├── drizzle.ts                 # Drizzle ORM client
├── filters.ts                 # Soft-delete filter helpers (isNotDeleted)
├── sql.ts                     # Load colocated .sql files (loadSql)
└── db/
    ├── schema/                # Table definitions
    │   ├── core.ts            # Organization, lugar, disciplina
    │   ├── artist.ts          # Artista, catalogo, agrupacion
    │   ├── events.ts          # Evento, edicion, actividades
    │   ├── participations.ts  # Participantes, exposiciones
    │   ├── auth.ts            # Better Auth tables
    │   └── index.ts           # Schema exports
    ├── relations.ts           # Drizzle relations
    └── types.ts               # Custom types

migrations/                    # Drizzle Kit migrations
├── 0000_core.sql
├── 0001_artista.sql
└── meta/_journal.json

data/                          # Reference SQL files (not migrations)
├── 001_core.sql
├── 002_evento.sql
└── ...

seed/
├── seed.sql                   # Seed data (15 artists, 1 event, participations)
│
scripts/
└── seed.ts                    # Script: make local.dev.db, run migrations, run seed.sql
```

### Dual Client Pattern

- **Drizzle ORM:** type-safe relational.
- **Raw SQL:** JSON aggregation, complex queries.

## Schema Definition

Tables via `drizzle-orm/sqlite-core`.

## Migrations

- **Tool:** drizzle-kit → `migrations/`
- **Statement separator:** `--> statement-breakpoint` between SQL statements
- **No blank lines** between statements in a single migration

## Environment Variables

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
TURSO_DATABASE_NAME=
```

## Data Files (Reference)

Sequential (001, 002…). Not migrations. Reference only.
