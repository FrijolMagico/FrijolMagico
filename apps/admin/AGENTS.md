# AGENTS.md - Admin App

Admin panel - Port 3001

**Generated**: 2026-02-11
**Mode**: Update

## Tech Stack

- **Framework:** Next.js 16+ (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **Auth:** Better Auth with Google OAuth
- **Components:** Shadcn/ui for reusable UI elements
- **Others:**: Read package.json for more details on dependencies and scripts.

## Commands

```bash
bun run build                  # Production build
bun run lint                   # ESLint
bun run type-check             # tsc --noEmit
```

## Architecture

Featured-based Architecture with clear separation of concerns.

### App Router Architecture First

- Leverage Server Components by default, Client Components only when necessary
- Use proper file conventions: page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx
- Implement route groups (group-name) for organization without affecting URL structure
- Use private folders \_folder to opt out of routing system

### Server-First Architecture

- Server Components by default - add "use client" only when required
- Optimize data fetching at the server level
- Implement streaming with loading.tsx and Suspense boundaries
- Use Server Actions for form handling and mutations
- Leverage static generation and ISR for performance
- Use DAL (Data Access fayer) patterns to separate data logic
- To prevent accidental usage in Client Components, you can use the server-only package, this is a MUST for Server Actions and recommended for all server-only code

### Screaming Architecture for Next.js

Your structures must IMMEDIATELY communicate what the application does:

- Feature names must describe business functionality, not technical implementation
- Directory structure should tell the story of what the app does at first glance
- Route structure should mirror business logic, not technical concerns

```
src/
    app/
    ├── api/auth/[...all]/          # Better Auth API routes
    │
    ├── (auth)/
    │   ├── _components/            # Shared auth components
    │   └── login/
    │       ├── _components/        # Private: login-specific components
    │       └──  page.tsx           # /login route with Google OAuth button
    │
    ├── (dashboard)/                # Feature folder with sections related to its own
    │   ├── dashboard/              # Dashboard related files (Only scoped to dashboard)
    │   │   ├── _components/        # Private: dashboard-specific components
    │   │   ├── loading.tsx         # Loading UI
    │   │   ├── error.tsx           # Error UI
    │   │   └── page.tsx            # /dashboard route
    │   ├── profile/                # Profile management (future) with same principles as dashboard
    │   │   ├── _lib/
    │   │   ├── _actions/
    │   │   ├── _hooks/
    │   │   ├── loading.tsx
    │   │   ├── error.tsx
    │   │   └── page.tsx
    │   └── layout.tsx              # Dashboard layout (if needed, this is an example)
    │
    ├── (admin)/
    │   └──...                      # Admin routes with same principles as dashboard (organizacion, catalogo, etc.)
    ├── layout.tsx                  # Root layout
    └── page.tsx                    # Home route, Redirects to dashboard/login

    shared/                         # ONLY for 2+/global route group usage
    ├── components/
    │   └── ui/                     # Reusable UI components (shadcn/ui)
    ├── draft/                      # Specific feature named "draft" with its own structure (can have components, lib, etc. scoped to it)
    ├── global-save/                # Specific feature named "global-save" with its own structure (can have components, lib, etc. scoped to it)
    └── ...                         # Other global features with same principles as draft and global-save

    lib/                            # Utilities and configurations (auth, db, etc.)
    styles/                         # Global styles (Tailwind config, pallettes, etc.)
    .../                            # Other global files (types, etc.)
```

> NOTE: This structure is a guideline and can be adjusted as needed, but the key principles of feature-based organization and separation of concerns should always be maintained.

### Authentication

- **Provider:** Better Auth with Drizzle adapter
- **Method:** Google OAuth only (no email/password)
- **Restriction:** Only `@frijolmagico.cl` domain allowed
- **Session:** 3-day expiration, 24-hour update age
- **Config:** `src/app/auth/lib/auth.ts`


### Store Initialization Pattern

Cada sección que maneja estado UI con el patrón Entity State debe tener un **componente de inicialización dedicado** que se encarga de:

1. **Sincronizar proyección** — `useProjectionSync` conecta el operation-log con el projection-engine
2. **Detectar cambios pendientes** — `useJournalRestore` verifica si hay entries en IndexedDB de sesiones anteriores
3. **Mostrar banner de restauración** — Si hay cambios pendientes, muestra el `SectionPendingBanner`

#### Beneficios

- **Separación de responsabilidades**: Los componentes de UI no manejan inicialización de stores
- **Consistencia**: Todas las secciones siguen el mismo patrón
- **Testeabilidad**: La inicialización se puede testear independientemente
- **Claridad**: A nivel de server component se ve qué stores se inicializan

#### Hooks Involucrados

| Hook | Responsabilidad | Ubicación |
|------|-----------------|-----------|
| `useProjectionSync` | Sincroniza operation-log ↔ projection-engine | `src/shared/hooks/use-projection-sync.ts` |
| `useJournalRestore` | Detecta entries en journal + provee banner de restauración | `src/shared/hooks/use-journal-restore.tsx` |

#### Entidades Journal

Las entidades disponibles para journal están definidas en `src/shared/lib/database-entities.ts`:

```typescript
JOURNAL_ENTITIES = {
  ORGANIZACION: 'organizacion',
  ORGANIZACION_EQUIPO: 'organizacion_equipo',
  ARTISTA: 'artista',
  CATALOGO_ARTISTA: 'catalogo_artista',
  ARTISTA_HISTORIAL: 'artista_historial'
}
```

### Components

- **Own:** snake-case for components (e.g., `user-profile.tsx`)
- **Shadcn/ui:** default naming conventions

### Database

- Uses `@frijolmagico/database` package
- Better Auth Drizzle adapter for user/session tables
- SQLite provider (Turso/libSQL)

## Forbidden Patterns

- **NEVER barrel files** — import directly from source
- **NEVER default exports** — named exports only
- **NEVER client-side auth checks** — all auth server-side
- **NEVER unnecessary client components** — prefer Server Components
- **NEVER Pages Router** — App Router only
- **NEVER use `any` types**

## General Rules

- Dashboard and future admin pages should verify session server-side using `get-session.ts` helper
- No client-side auth checks (except for UI adjustments), all auth logic must be server-side
- Follow feature-based organization and clear separation of concerns
- Use `cn()` utility for conditional class names
- Avoid client components if not necessary — prefer Server Components
- Split interactive sections into separate client components, keep rest as server
- A feature is finished when: no linter/format errors, no runtime errors, Playwright tests pass
