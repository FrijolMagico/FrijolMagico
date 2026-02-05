# @frijolmagico/database

Database package for the Frijol Mágico monorepo. Provides access to Turso/libSQL via two interfaces:

- **Raw Client (libSQL)**: Direct SQL queries
- **Drizzle ORM Client**: Type-safe queries with relations

## Installation

This is an internal monorepo package:

```bash
bun install
```

## Package Exports

```typescript
import { db } from '@frijolmagico/database/orm'      // Drizzle ORM client
import { executeQuery } from '@frijolmagico/database/client'  // Raw SQL client
import { schema } from '@frijolmagico/database/schema'        // Schema exports
```

## Project Structure

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
data/                          # Reference SQL files
seed/                          # Seed data
```

## Commands

```bash
# Run from packages/database/ or via root
bun run migrate             # Run pending migrations
bun run new <name>          # Create new migration
bun run seed                # Run seed.sql
bun run lint                # ESLint
bun run type-check          # TypeScript check
```

## Usage

### Drizzle ORM Client

```typescript
import { db } from '@frijolmagico/database/orm'
import { artista } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

// Simple query
const artistas = await db.select().from(artista)

// With filters
const activos = await db
  .select()
  .from(artista)
  .where(eq(artista.estadoId, 1))

// With relations
const conImagenes = await db.query.artista.findMany({
  with: {
    imagenes: true,
    estado: true
  }
})

// Insert
const [nuevo] = await db
  .insert(artista)
  .values({ pseudonimo: 'Nombre', slug: 'nombre' })
  .returning()
```

### Raw SQL Client

```typescript
import { executeQuery, executeBatch, executeInsert } from '@frijolmagico/database/client'

// Query
const { data, error } = await executeQuery<{ id: number; nombre: string }>(
  'SELECT id, nombre FROM artista WHERE estado_id = ?',
  [1]
)

// Insert with ID
const { lastInsertRowid, error } = await executeInsert(
  'INSERT INTO artista (pseudonimo, slug) VALUES (?, ?)',
  ['Nombre', 'slug']
)

// Batch
await executeBatch([
  { sql: 'UPDATE artista SET ciudad = ? WHERE id = ?', params: ['Santiago', 1] }
])
```

## Schema

26 tables organized by domain:

- **Core**: organizacion, organizacion_equipo, lugar, disciplina
- **Artists**: artista, artista_imagen, artista_historial, catalogo_artista, agrupacion
- **Events**: evento, evento_edicion, evento_edicion_dia, evento_edicon_metrica, evento_edicion_snapshot, evento_edicion_postulacion
- **Participations**: tipo_actividad, modo_ingreso, evento_edicion_participante, participante_exposicion, participante_actividad, actividad
- **Auth**: user, session, account, verification (Better Auth)

## Migrations

Uses drizzle-kit with custom SQL:

```bash
# Create migration
bun run new nombre-migracion

# Edit migrations/000N_nombre-migracion.sql
# Use --> statement-breakpoint between statements

# Apply
bun run migrate
```

## Environment Variables

See `.env.example` in this directory for required variables.

```bash
cp .env.example .env.local
```

Key variables:
- `TURSO_DATABASE_URL` - Database URL (remote or file:local.db)
- `TURSO_AUTH_TOKEN` - Auth token for remote databases
- `TURSO_DATABASE_NAME` - Database name for CLI commands

## Dual Client Pattern

- **Admin app**: Uses Drizzle ORM for complex relational queries
- **Web app**: Uses raw SQL for optimized manual queries
- Both share the same underlying libSQL connection

## See Also

- [Root README](../../README.md) - Project overview
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Turso Docs](https://docs.turso.tech/)
