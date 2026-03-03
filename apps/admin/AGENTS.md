# Admin App — Knowledge Base

**Generated:** 2026-03-02
**Commit:** 420f739
**Branch:** dev

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
│   │       ├── artistas/               # Artist management (largest feature)
│   │       │   ├── catalogo/           # Catalog sub-feature (25 files)
│   │       │   └── listado/            # List sub-feature (16 files)
│   │       ├── general/                # Organization + team management
│   │       ├── eventos/                # Events (stub)
│   │       └── config/                 # Configuration (stub)
│   ├── layout.tsx                      # Root: fonts, theme, toaster
│   └── page.tsx                        # Redirects to /dashboard
├── shared/                             # Cross-route modules (see shared/AGENTS.md)
│   ├── components/                     # UI: shadcn/ui + custom components
│   ├── hooks/                          # Sync hooks: journal, projection, dirty
│   ├── lib/                            # Glue: entities, registries, stores
│   ├── operations/                     # Core: journal, log, projection
│   ├── push/                           # Persistence pipeline
│   └── ui-state/                       # Pagination + filters factories
├── lib/                                # Global: auth, utils, cdn, navigation
├── hooks/                              # App-level hooks (use-mobile)
├── styles/                             # globals.css (Tailwind v4 theme)
└── proxy.ts                            # Middleware-like session check
```

## Where to Look

| Task              | Location                           | Notes                                                               |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Add admin feature | `src/app/(authenticated)/(admin)/` | Copy artistas pattern                                               |
| Auth config       | `src/lib/auth/`                    | index.ts (Better Auth), config.ts (constants), utils.ts (helpers)   |
| Protect a route   | `src/lib/auth/utils.ts`            | Call `requireAuth()` in page component                              |
| Add UI component  | `src/shared/components/ui/`        | Shadcn/ui, imported as `@/shared/components/ui/[name]`              |
| Add shared hook   | `src/shared/hooks/`                | `use-` prefix, `'use client'` directive                             |
| Server Action     | Feature `_actions/` dir            | `'use server'`, accepts `PushOperation[]`, returns `PushResult`     |
| Data fetching     | Feature `_lib/` dir                | `'use cache'` + `cacheTag()`, imports from `@frijolmagico/database` |
| Zustand store     | Feature `_store/` dir              | Use factories from `shared/operations/`                             |
| Zod schema        | Feature `_schemas/` dir            | Shared between client validation and server actions                 |
| Navigation menu   | `src/lib/navigation.ts`            | Add entry, update ROUTE_ENTITY_MAP in database-entities.ts          |
| Global styles     | `src/styles/globals.css`           | OKLch color system, custom radius scale                             |
| Tests             | `tests/unit/`                      | Mirror source paths, `.test.ts` suffix, Bun test runner             |

## Commands

```bash
bun run build                  # Production build
bun run lint                   # ESLint src/
bun run type-check             # tsc --noEmit
bun test                       # Unit tests (Bun)
bun run test:e2e               # E2E tests (Playwright)

# Dev server (check if ports 3001/8080 are already in use first)
turbo dev --filter=@frijolmagico/database --filter=@frijolmagico/admin
```

## Feature Architecture

Every admin feature follows this structure (see artistas/catalogo as reference):

```
feature/
├── _actions/       # Server Actions ('use server', PushOperation[] -> PushResult)
├── _components/    # Client components ('use client' only when needed)
├── _hooks/         # Feature hooks (push, list filtering, etc.)
├── _lib/           # DAL: server-side data fetching ('use cache' + cacheTag)
├── _schemas/       # Zod schemas (shared client + server validation)
├── _store/         # Zustand stores (operation log + projection + UI)
├── _types/         # TypeScript types
├── _constants/     # Feature constants
└── page.tsx        # Route page (default export, calls requireAuth())
```

### Data Flow (Local-First)

```
User Action → OperationLog (Zustand) → Journal (IndexedDB) → Push (Server Action) → Database
                    ↓
            ProjectionStore (derived UI state with __meta flags)
                    ↓
            DirtyStore (amber dot in sidebar)
```

Key hooks in `src/shared/hooks/`:

- `useJournalSync` — OperationLog → IndexedDB (debounced auto-save)
- `useProjectionSync` — OperationLog → ProjectionStore (reactive UI)
- `useDirtySync` — ProjectionStore → SectionDirtyStore (save bar)
- `useJournalRestore` — IndexedDB → OperationLog (page reload recovery)

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
@/shared/*    → src/shared/*
@/admin/*     → src/app/(authenticated)/(admin)/*
@/dashboard/* → src/app/(authenticated)/(dashboard)/*
@/auth/*      → src/app/(auth)/*
@/lib/*       → src/lib/*
@/hooks/*     → src/hooks/*
@/types/*     → src/types/*
@/styles/*    → src/styles/*
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
- **Zustand 5** stores created via factories (`createEntityOperationStore`, `createProjectionStore`, `createPaginationStore`, `createFilterStore`)
- **Zod 4** for validation (double validation: client in `usePush`, server in Server Actions)
- **Server Actions** accept `PushOperation[]`, use `validateOperationData()`, return `PushResult`
- **DAL pattern:** `'use cache'` + `cacheTag()` in feature `_lib/` files
- **UI text in Spanish** (user-facing labels), **code/comments in English**
- **Lucide** for icons

## Forbidden Patterns

- **NEVER barrel files** — import directly from source (exception: complex modules like operations, pagination)
- **NEVER default exports** — named exports only (exception: page.tsx, layout.tsx per Next.js convention)
- **NEVER client-side auth checks** — all auth server-side via `requireAuth()`
- **NEVER unnecessary `'use client'`** — Server Components by default
- **NEVER Pages Router** — App Router only
- **NEVER `any` types** — strict TypeScript enforced
- **NEVER `as any`, `@ts-ignore`, `@ts-expect-error`** — fix the type
- **NEVER Spanish in code/comments** — English only (UI labels are Spanish)
- **NEVER `server-only` skip** — MUST use `server-only` package for Server Actions

## Cross-Workspace Dependencies

- `@frijolmagico/database` — Drizzle ORM client (`/orm`) and schema (`/schema`)
- `@frijolmagico/tailwind-config` — Shared Tailwind config and brand palette
- `@frijolmagico/utils` — Shared utilities
- `@frijolmagico/eslint-config` — ESLint rules (extends Next.js)
- `@frijolmagico/typescript-config` — Base TypeScript config (strict)

## Testing

- **Unit:** Bun test runner, files in `tests/unit/` mirroring `src/` structure, `.test.ts` suffix
- **E2E:** Playwright (configured, sparse tests)
- **Verify changes:** `bun run type-check && bun run lint && bun test`

## Notes

- `src/proxy.ts` exists but is NOT a middleware.ts — it's a route matcher config for session checks
- `docs/journal-issues/` contains known technical debt items for the journal system
- `eventos` and `config` routes are stubs — follow artistas pattern when implementing
- Entity definitions in `src/shared/lib/database-entities.ts` must be updated when adding new entities
- `ROUTE_ENTITY_MAP` in same file connects routes to entities for dirty-state tracking
