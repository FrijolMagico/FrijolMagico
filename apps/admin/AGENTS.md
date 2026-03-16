# Admin App — Knowledge Base

## Overview

Admin panel for Frijol Magico Cultural Association. Next.js 16 (App Router) with React 19, TypeScript strict, Tailwind CSS v4, Better Auth (Google OAuth), Shadcn/ui, Zustand 5, Zod 4. Local-first architecture with IndexedDB journal and server-side persistence via Server Actions.

## Structure

```
src/
├── app/
│   ├── (auth)/                         # Public: login + OAuth API
│   │   ├── api/auth/[...all]/          # Better Auth catch-all handler
│   │   └── login/                      # Google OAuth login page
│   ├── (authenticated)/                # Protected: sidebar layout
│   │   ├── (dashboard)/dashboard/      # Overview page
│   │   └── (admin)/                    # Admin features
│   │       └── (entity)/               # Base route for each entity (artistas, eventos, organizaciones...)
│   │           ├── _actions/           # Server Actions ('use server', import 'server-only', updateTag)
│   │           ├── _components/        # Components ('use client' only when needed)
│   │           ├── _constants/         # Feature-specific constants
│   │           ├── _hooks/             # Feature-specific hooks
│   │           ├── _lib/               # DAL: server-side data fetching ('use cache' + cacheTag) and utilities
│   │           ├── _schemas/           # Database schemas (Zod, shared client/server validation)
│   │           ├── _store/             # Zustand stores (client state management, import factories) Only when needed
│   │           ├── _types/             # TypeScript types (shared client/server types)
│   │           ├── (sub-entity)/       # Optional nested routes (e.g. eventos/edicion, artistas/catalogo)
│   │           └── page.tsx            # Route page (default export, calls requireAuth())
│   ├── globals.css                     # Root: fonts, theme, toaster
│   ├── layout.tsx                      # Root: fonts, theme, toaster
│   └── page.tsx                        # Redirects to /dashboard
├── shared/                             # Cross-route modules (see shared/AGENTS.md)
│   ├── components/                     # UI: shadcn/ui + custom components
│   ├── hooks/                          # Reusable custom hooks
│   ├── lib/                            # Utilities, infra, general configs
│   ├── schemas/                        # Shared Zod schemas
│   └── types/                          # Shared TypeScript types
└── proxy.ts                            # Middleware-like session check
```

## Commands

```bash
bun run build                  # Production build
bun run lint                   # ESLint src/
bun run type-check             # tsc --noEmit
bun test                       # Unit tests (Bun)

# Dev server (check if ports 3001/8080 are already in use first)
turbo dev --filter=@frijolmagico/database --filter=@frijolmagico/admin
```

## Authentication

- **Provider:** Better Auth with Drizzle adapter (SQLite)
- **Method:** Google OAuth only (email/password disabled)
- **Restriction:** `@frijolmagico.cl` domain only
- **Session:** 3-day expiration, 24-hour update age
- **Config:** `src/lib/auth/index.ts`
- **Server-side only:** Use `requireAuth()` or `getSession()` from `src/lib/auth/utils.ts`
- **No middleware.ts:** Auth checked per-page via `requireAuth()`

## Path Aliases

```
@/admin/*     → src/app/(authenticated)/(admin)/*
@/dashboard/* → src/app/(authenticated)/(dashboard)/*
@/auth/*      → src/app/(auth)/*
@/tests/*     → tests/*
@/*           → src/* (fallback)
```

## Conventions

- **No semicolons**, single quotes (JSX too), 2-space indent, no trailing commas (Prettier)
- **Component files:** kebab-case (`user-profile.tsx`)
- **Imports:** React/Next → External → `@frijolmagico/*` → `@/` → Relative → `import type`
- **React Compiler** enabled — no manual `useMemo`/`useCallback` needed
- **`cn()`** for conditional Tailwind classes (from `@/lib/utils`)
- **Tailwind v4** with `@theme` syntax, OKLch colors, `@frijolmagico/tailwind-config` base
- **Shadcn/ui** components at `@/shared/components/ui/` (Base UI primitives, not Radix)
- **Zod 4** for validation (double validation: client in `usePush`, server in Server Actions)
- **Drizzle-Zod** for schema derivation (see Schema Guide below)
- **DAL pattern:** `'use cache'` + `cacheTag()` in feature `_lib/` files
- **UI text in Spanish** (user-facing labels), **code/comments in English**
- **Tabler Icons** for icons

## Forbidden Patterns

- **NEVER barrel files** — import directly from source (exception: complex modules like operations, pagination)
- **NEVER default exports** — named exports only (exception: page.tsx, layout.tsx per Next.js convention)
- **NEVER client-side auth checks** — all auth server-side via `requireAuth()`
- **NEVER unnecessary `'use client'`** — Server Components by default
- **NEVER Pages Router** — App Router only
- **NEVER `any` types** — strict TypeScript enforced
- **NEVER `as any`, `@ts-ignore`, `@ts-expect-error`** — fix the type
- **NEVER Spanish in code/comments** — English only (UI labels are Spanish)
- **NEVER `server-only` skip** — MUST use `server-only` package for Server Actions, verify if is installed, if not, install it

## Cross-Workspace Dependencies

- `@frijolmagico/database` — Drizzle ORM client (`/orm`) and schema (`/schema`)
- `@frijolmagico/tailwind-config` — Shared Tailwind config and brand palette
- `@frijolmagico/utils` — Shared utilities
- `@frijolmagico/eslint-config` — ESLint rules (extends Next.js)
- `@frijolmagico/typescript-config` — Base TypeScript config (strict)

## Testing

- **Unit:** Bun test runner, files in `tests/unit/` mirroring `src/` structure, `.test.ts` suffix
- **Verify changes:** `bun run type-check && bun run lint && bun test`

## Notes

- `src/proxy.ts` exists but is NOT a middleware.ts — it's a route matcher config for session checks

## Schema Guide (Drizzle-Zod)

All Zod schemas in the admin app should derive from Drizzle table definitions. This ensures a single source of truth.

### Pattern

```typescript
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

// Server INSERT - exact DB schema, number IDs
export const artistaInsertSchema = createInsertSchema(artist, {
  pseudonimo: (s) => s.min(1, { message: 'El pseudónimo es obligatorio' }),
  slug: (s) => s.min(1, { message: 'El slug es obligatorio' })
})

// Server UPDATE - all fields optional
export const artistaUpdateSchema = createUpdateSchema(artist)

// Client form - string IDs, simplified fields
export const artistaFormSchema = artistaInsertSchema
  .pick({
    nombre: true,
    pseudonimo: true
  })
  .extend({
    pseudonimo: z.string().min(1)
  })

// Export types
export type ArtistaInsertInput = typeof artistaInsertSchema._type
export type ArtistaFormInput = typeof artistaFormSchema._type
```

### Client vs Server Validation

| Layer                     | IDs      | Example                                        |
| ------------------------- | -------- | ---------------------------------------------- |
| **Server** (InsertSchema) | `number` | `eventoId: z.number().int().positive()` |
| **Client** (FormSchema)   | `string` | `eventoId: z.string().min(1)`                  |

### Imports

```typescript
// Drizzle tables
import { artist, event, organization } from '@frijolmagico/database/schema'

// Drizzle-Zod
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
```

### Key Points

- Preserve Spanish error messages in refinements
- Use `.pick()`, `.omit()`, `.extend()` for form schemas
- Export backward-compat aliases if needed: `export const artistaSchema = artistaInsertSchema`
