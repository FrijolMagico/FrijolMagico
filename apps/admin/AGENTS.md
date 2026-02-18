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

### UI State Management - Entity State Pattern

El sistema de gestión de estado UI utiliza una **arquitectura de 3 capas** basada en el patrón Entity State para garantizar consistencia y performance O(1).

- **Layer 1 (Remote Data):** Datos inmutables del servidor.
- **Layer 2 (Applied Changes):** Cambios confirmados en el journal local.
- **Layer 3 (Current Edits):** Ediciones en memoria (drafts).

#### Factory Comparison

| Caso de Uso                 | Factory Recomendada        | Razón                                                    |
| --------------------------- | -------------------------- | -------------------------------------------------------- |
| Objetos planos              | `createUIStateStore`       | Simple, sin overhead de normalización                    |
| Colecciones pequeñas (< 50) | `createUIStateStore`       | Suficiente para estados simples                          |
| Colecciones grandes (200+)  | `createEntityUIStateStore` | **OBLIGATORIO**: O(1) en todas las operaciones           |
| Modo Singleton              | `createEntityUIStateStore` | Usar `isSingleton: true` para objetos únicos con journal |

#### Performance Targets

| Operación       | Objetivo |
| --------------- | -------- |
| Lookup          | < 1ms    |
| Update          | < 1ms    |
| Delete          | < 1ms    |
| Bulk (50 items) | < 16ms   |
| Scroll FPS      | 60fps    |

Para más detalles, consultar [apps/admin/src/shared/ui-state/README.md](./src/shared/ui-state/README.md).

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

## UI State Management

Uses **Entity State Pattern** with 3-layer architecture.

See [shared/ui-state/AGENTS.md](./src/shared/ui-state/AGENTS.md) for details.

## General Rules

- Dashboard and future admin pages should verify session server-side using `get-session.ts` helper
- No client-side auth checks (except for UI adjustments), all auth logic must be server-side
- Follow feature-based organization and clear separation of concerns
- Use `cn()` utility for conditional class names
- Avoid client components if not necessary — prefer Server Components
- Split interactive sections into separate client components, keep rest as server
- A feature is finished when: no linter/format errors, no runtime errors, Playwright tests pass
