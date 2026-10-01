# Database Package

Drizzle ORM + Turso (libSQL) database package.

## Tech Stack

- **ORM:** Drizzle ORM
- **Database:** Turso (libSQL) for staging and production; separate local snapshots for dev and production-data inspection
- **Client:** @libsql/client
- **Schema:** TypeScript with drizzle-orm/sqlite-core

## Commands

```bash
bun --no-env-file run pull:staging    # read staging into local.dev.db
bun --no-env-file run pull:production # read production into local.db
bun run dev                # serve local.dev.db
bun run prod               # serve local.db
bun run migrate:staging    # remote write: staging only
bun run migrate:production # remote write: production only, separately authorized
bun run new <name>
bun run lint
bun run type-check
```

- Stop all local database users before pulling. Pulls overwrite only the selected local file after validation; keep a private backup if rollback matters. Never commit snapshots, dumps, credentials, or SQLite WAL/SHM sidecars.
- Remote migrations require separate human authorization for staging and then production. Production also requires `TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:<production-name>`; this confirmation is not authorization. Verify identity, pending migrations, backup and remote state before writes or retries. Do not run destructive remote database operations without explicit permission. See [README.md](./README.md) for variables, CLI login, and rollback.
- No public seed, generic migrate, or dev R2 reset command. `seed/seed.sql` remains a test fixture/reference only. The legacy `scripts/clean-devr2/reset-dev-r2.ts` preserves seed assets, not real staging snapshot assets; never run it manually against `local.dev.db`. It aborts before R2 activity when that file exists. Any replacement cleanup needs snapshot-aware review and separate authorization.

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
└── seed.sql                   # Test fixture/reference, not a local refresh workflow
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

- Pull: `TURSO_STAGING_DATABASE_NAME` or `TURSO_PRODUCTION_DATABASE_NAME` and separate Turso CLI authentication (`turso auth login`). No app URL or token.
- Migrate: `bun run migrate:staging` and `bun run migrate:production` load the ignored package `.env.local`. Each command requires only its selected destination's `TURSO_STAGING_DATABASE_NAME` / `TURSO_STAGING_DATABASE_URL` / `TURSO_STAGING_AUTH_TOKEN` or corresponding `TURSO_PRODUCTION_*` keys. Production additionally requires `TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:<production-name>`. Drizzle Kit applies the same versioned migrations but tracks applied revisions separately within each database.
- Generic `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` are ignored by migrations; pulls still reject them. Keep all credentials private and never execute remote migrations without destination-specific human authorization.

## Data Files (Reference)

Sequential (001, 002…). Not migrations. Reference only.
