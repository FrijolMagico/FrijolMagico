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

# To run the development server with Turbopack (fast refresh, optimized for development)
# 1. Verify if dev servers are running: 3001 admin and 8080 database
# 2. To run only admin without database (not recommended, may cause errors):
turbo dev --filter=@frijolmagico/admin
# 3. To run only database (if admin dev is already running)
turbo dev --filter=@frijolmagico/database
# 4. To run both admin and database (recommended for development):
turbo dev --filter=@frijolmagico/database --filter=@frijolmagico/admin
# DO NOT RUN ANY DEV SERVER IF ALREADY RUNNING
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
    ├── <module>/                   # Specific feature named with its own structure
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

### Naming Conventions  
- **Components:** snake-case (e.g., `user-profile.tsx`)

### Database

- Uses `@frijolmagico/database` package
- Better Auth Drizzle adapter for user/session tables

## Forbidden Patterns

- **NEVER barrel files** — import directly from source unless its a complex module
- **NEVER default exports** — named exports only
- **NEVER client-side auth checks** — all auth server-side
- **NEVER unnecessary client components** — prefer Server Components
- **NEVER Pages Router** — App Router only
- **NEVER use `any` types**

## General Rules

- Use `cn()` utility for conditional class names
- If you are working in a worktree, do an `bun install` in the root
- To test the site from a worktree, need to copy the .env.local file
