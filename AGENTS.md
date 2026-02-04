# AGENTS.md - Frijol Magico

Concise rules for agentic coding assistants in this Turborepo monorepo.

## Tech Stack

- **Monorepo:** Turborepo + Bun workspaces (`apps/*`, `packages/*`)
- **Apps:** `web` (port 3000), `admin` (port 3001)
- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **State:** Zustand
- **Animation:** GSAP with ScrollTrigger
- **Database:** Turso (libSQL) with Drizzle ORM
- **CMS:** Google Sheets via `google-spreadsheet`
- **Package Manager:** Bun

## Build / Lint / Format Commands

Root commands:

```bash
bun install                    # Install dependencies
bun run dev                    # Start all apps (Turbo)
bun run dev:real               # Dev with DATA_SOURCE=real
bun run build                  # Production build (all apps)
bun run lint                   # ESLint all apps
bun run lint:fix               # ESLint with auto-fix
bun run format                 # Prettier format (run this!)
bun run type-check             # TypeScript check all packages
```

Per-app commands (in `apps/web/` or `apps/admin/`):

```bash
bun run dev                    # Next.js dev with Turbopack
bun run build                  # Production build
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # tsc --noEmit
```

## Database Commands (Drizzle)

```bash
bun run db:migrate             # Run pending migrations
bun run db:new <name>          # Create new migration
bun run db:seed                # Run seed.sql
```

**Note:** Uses Drizzle ORM, NOT Geni. Migrations via `drizzle-kit`.

## Testing

**No test framework configured.**

## Code Style

### Prettier Config

- No semicolons
- Single quotes (JSX too)
- 2-space indent
- No trailing commas
- `prettier-plugin-tailwindcss` for class ordering

### Import Order

Group with blank lines between:

1. React / Next.js (`react`, `next/*`)
2. External libraries
3. Workspace imports (`@frijolmagico/*`)
4. Internal absolute imports (`@/` = `src/`)
5. Relative imports
6. Type-only imports (`import type`)

Example:

```typescript
import { useState } from 'react'
import Image from 'next/image'

import { create } from 'zustand'

import { cn } from '@frijolmagico/ui/cn'

import { paths } from '@/config/paths'
import { Header } from '@/components/Header'

import { LocalComponent } from './LocalComponent'

import type { Artist } from '@/types/artists'
```

### Naming Conventions

| Type         | Convention                    | Example                     |
| ------------ | ----------------------------- | --------------------------- |
| Components   | PascalCase, **named exports** | `CatalogArtistCard.tsx`     |
| Hooks/Stores | camelCase with `use` prefix   | `useCatalogFiltersStore.ts` |
| Utilities    | camelCase                     | `formatUrl`, `cn`           |
| Constants    | UPPER_SNAKE_CASE              | `DEFAULT_FILTERS`           |
| Types        | PascalCase                    | `CatalogArtist`             |
| Zod Schemas  | camelCase with `Schema`       | `artistaSchema.ts`          |

### TypeScript

- Strict mode. Never disable `strict` or `noImplicitAny`.
- Use `import type { X }` for type-only imports.
- Global types: `src/types/` (e.g., `artists.d.ts`)
- Section types: `app/(sections)/[name]/types/`
- Use Zod v4 schemas for runtime validation.

### React Patterns

- Use **App Router** (`src/app/`). Prefer Server Components.
- Mark Client Components with `'use client'`.
- **Named exports only** - never default exports.
- Destructure props in function signature.
- Use `cn()` for conditional classnames.
- Avoid direct DOM manipulation; use refs + GSAP.

### Workspace Imports

```typescript
import { cn } from '@frijolmagico/ui/cn'
import { Button } from '@frijolmagico/ui/button'
import { db } from '@frijolmagico/database'
import { schema } from '@frijolmagico/database/schema'
import { classVariantSelector } from '@frijolmagico/utils/css'
```

### Tailwind v4

- Use `tailwind-variants` (`tv()`) for component variants.
- Keep long class lists organized via `cn()`.

### Error Handling

- Data-fetching returns `{ data, error }` shape.
- Log errors with `console.error()` server-side.
- Use `ErrorSection` component for UI errors.
- Provide safe fallbacks (empty arrays, defaults).

### Security

- **Never commit secrets or `.env` files.**
- Use `.env.local` (gitignored) for secrets.
- Ask permission before destructive DB operations.

## Directory Structure

```
apps/
  web/                    # Main Next.js app (frijolmagico.cl)
    src/
      app/                # App Router with (sections) groups
      components/         # Shared UI
      config/             # Configuration
      hooks/              # Shared hooks
      infra/              # Adapters (DB, CMS)
      schemas/            # Zod schemas
      styles/             # Global styles
      types/              # Global types
      utils/              # Utilities
  admin/                  # Admin panel (port 3001)

packages/
  database/               # Drizzle ORM + Turso
  ui/                     # Shared UI components
  utils/                  # Shared utilities
  eslint-config/          # Shared ESLint
  typescript-config/      # Shared TS config
  tailwind-config/        # Shared Tailwind
```

## Data Source Configuration

`DATA_SOURCE` env variable controls data sources in development:

- **Not set (default):** Intelligent defaults:
  - `prod='cms'` → use `'mock'` in dev
  - `prod='database'` → use `'local'` (file:local.db)
- **`DATA_SOURCE=real`:** Force production data sources
- **`DATA_SOURCE=local`:** Same as default

**Production:** `DATA_SOURCE` ignored. Mock data never allowed.

## Database Operations

- Migrations: `drizzle-kit` via `bun run db:migrate`
- Seeds: `db/seed/seed.sql`
- Non-seed data: Numbered files in `db/data/`
- Always ask permission before destructive operations.

## Operational Rules

1. **Read before editing** - Always read files first.
2. **Minimal changes** - Keep focused on the task.
3. **No destructive commands** without user approval.
4. **Do not commit** unless user explicitly requests.
5. **Before build:** Run `bun run lint` and `bun run format`.
6. **UI changes:** Ask user to verify with `bun run dev`.

## If You Modify This File

- Keep concise and actionable.
- Document new tooling and single-test commands.
- Update `package.json` if adding scripts.
