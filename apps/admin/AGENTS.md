## Structure
```
src/
├── app/
│   ├── (auth)/                         # Public
│   │   ├── api/auth/[...all]/          # Better Auth
│   │   └── login/                      # Google OAuth login
│   ├── (core)/                         # Private: Core features
│   │   ├── dashboard/                  # Overview
│   │   ├── entity/                     # Base route per entity
│   │   │   ├── _actions/               # Server Actions
│   │   │   ├── _components/            # Components
│   │   │   ├── _constants/             # Constants
│   │   │   ├── _hooks/                 # Hooks
│   │   │   ├── _lib/                   # DAL (use cache + cacheTag)
│   │   │   ├── _schemas/               # Schemas (Zod)
│   │   │   ├── _store/                 # Zustand (only when needed)
│   │   │   ├── _types/                 # Types
│   │   │   ├── (sub-entity)/           # Optional nested routes
│   │   │   └── page.tsx                # Route page
│   │   ├── (entity)/                   # Case when a entity needs api folder
│   │   │   ├── api/                    # Define scoped api folder
│   │   │   └── entity/                 # Base route of the entity
│   │   │       └──...                  # Same structure for entity scope
│   ├── (cron)/                         # Vercel Cron Jobs
│   │   ├── _lib/                       # Scheduled task logic
│   │   └── api/cron/                   # Cron HTTP endpoints
│   ├── globals.css                     # Root: fonts, theme, toaster
│   ├── layout.tsx                      # Root: fonts, theme, toaster
│   └── page.tsx                        # Redirects to /dashboard
├── shared/                             # Cross-route modules
│   ├── components/                     # UI: shadcn/ui + custom components
│   ├── hooks/                          # Reusable custom hooks
│   ├── lib/                            # Utilities, infra, general configs
│   ├── schemas/                        # Shared Zod schemas
│   └── types/                          # Shared TypeScript types
└── proxy.ts                            # Middleware-like session check
```
- Shared module rules: [src/shared/AGENTS.md](./src/shared/AGENTS.md)
## Commands
```bash
# Dev (check ports 3001/8080 first)
turbo dev --filter=@frijolmagico/database --filter=@frijolmagico/admin
```
## Authentication
- **Provider:** Better Auth with Drizzle adapter (SQLite)
- **Method:** Google OAuth only (email/password disabled)
- **Restriction:** `@frijolmagico.cl` domain only
- **Session:** 3-day expiration, 24-hour update age
- **Config:** `src/lib/auth/index.ts`
- Use `requireAuth()`/`getSession()` from `src/lib/auth/utils.ts`
- **No middleware.ts:** Auth checked per-page via `requireAuth()`
## Path Aliases
```
@/core/*      → src/app/(core)/*
@/auth/*      → src/app/(auth)/*
@/tests/*     → tests/*
@/*           → src/* (fallback)
```
## Conventions
- **React Compiler:** no manual `useMemo`/`useCallback`
- **Tailwind v4** with `@theme` syntax, OKLch colors, `@frijolmagico/tailwind-config` base
- **Shadcn/ui** at `@/shared/components/ui/` (not Radix)
- **Zod 4** for validation (double validation: client in `usePush`, server in Server Actions)
- **Drizzle-Zod** for schema derivation (see Schema Guide below)
- **DAL pattern:** `'use cache'` + `cacheTag()` in feature `_lib/` files
- **Tabler Icons** for icons
## Forbidden Patterns
- **NEVER client-side auth checks** — all auth server-side via `requireAuth()`

## Testing
- **Unit:** Bun test runner, files in `tests/unit/` mirroring `src/` structure, `.test.ts` suffix
- **Verify changes:** `bun run type-check && bun run lint && bun test`
## Schema Guide
- **All Zod schemas** derive from Drizzle via `drizzle-zod`.
- **Server schemas:** `createInsertSchema` / `createUpdateSchema` — IDs as `number`.
- **Client schemas:** Derive from server schema with `.pick()`, `.omit()`, `.extend()` — IDs as `string`.
- **Error messages:** Spanish in `.refine()` / `.min()` calls.
- **Type exports:** Always export `typeof schema._type` for insert and form inputs.

