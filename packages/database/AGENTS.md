# AGENTS.md - Database Package

Drizzle ORM + Turso (libSQL) database package.

## Tech Stack

- **ORM:** Drizzle ORM
- **Database:** Turso (libSQL) - SQLite for production, local file for dev
- **Client:** @libsql/client
- **Schema:** TypeScript with drizzle-orm/sqlite-core

## Commands

```bash
# Run from packages/database/ or root with filter
bun run migrate             # Run pending migrations
bun run new <name>          # Create new migration
bun run seed                # Run seed.sql
bun run lint                   # ESLint
bun run type-check             # TypeScript check
```

## Architecture

### Package Exports

```typescript
import { db } from '@frijolmagico/database/orm'      // Drizzle ORM client
import { executeQuery } from '@frijolmagico/database/client'  // Raw SQL client
import { schema } from '@frijolmagico/database/schema'        // Schema exports
```

### Directory Structure

```
src/
├── client.ts                  # Raw SQL client (Turso/libSQL)
├── drizzle.ts                 # Drizzle ORM client
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
└── seed.sql                   # Seed data
```

### Dual Client Pattern

**1. Drizzle ORM Client** (`src/drizzle.ts`)
- Type-safe queries with TypeScript
- Relations support
- Use for: Complex queries, type safety, relational data

```typescript
import { db } from '@frijolmagico/database/orm'
import { artista } from '@frijolmagico/database/schema'

const artistas = await db.select().from(artista)
```

**2. Raw SQL Client** (`src/client.ts`)
- Direct SQL execution
- Custom queries, JSON aggregation
- Use for: Complex aggregations, JSON results, custom SQL

```typescript
import { executeQuery } from '@frijolmagico/database/client'

const { data, error } = await executeQuery<ArtistResult>(
  'SELECT json_object(...) FROM artista WHERE ...',
  []
)
```

## Schema Definition

Tables defined with `drizzle-orm/sqlite-core`:

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const artista = sqliteTable('artista', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pseudonimo: text('pseudonimo').notNull().unique(),
  // ...
}, (table) => [
  index('idx_artista_estado').on(table.estadoId)
])
```

## Migrations

- **Tool:** drizzle-kit
- **Config:** `drizzle.config.ts`
- **Output:** `migrations/` directory
- **Dialect:** Turso (SQLite)

Custom SQL migrations supported. Use `--> statement-breakpoint` between statements.

## Environment Variables

```bash
TURSO_DATABASE_URL=https://[org].turso.io  # or file:local.db
TURSO_AUTH_TOKEN=your-auth-token           # Required for remote
```

## Data Files (Reference)

The `data/` directory contains reference SQL for schema design:
- Numbered sequentially (001, 002, ...)
- Not executed by migrations
- Use as reference for custom migrations
