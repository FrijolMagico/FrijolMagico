# AGENTS.md - Admin App

Admin panel - Port 3001

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **Auth:** Better Auth with Google OAuth
- **Components:** Radix UI primitives

## Commands

```bash
bun run dev                    # Next.js dev on port 3001
bun run build                  # Production build
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # tsc --noEmit
```

## Architecture

### App Router Structure

```
src/app/
├── api/auth/[...all]/          # Better Auth API routes
├── auth/
│   └── lib/
│       ├── auth.ts             # Better Auth configuration
│       ├── auth-client.ts      # Client-side auth
│       └── get-session.ts      # Server session helper
├── dashboard/
│   └── page.tsx                # Protected dashboard
├── login/
│   └── page.tsx                # Login page
├── layout.tsx
└── page.tsx                    # Redirects to dashboard
```

### Authentication

- **Provider:** Better Auth with Drizzle adapter
- **Method:** Google OAuth only (no email/password)
- **Restriction:** Only `@frijolmagico.cl` domain allowed
- **Session:** 3-day expiration, 24-hour update age
- **Config:** `src/app/auth/lib/auth.ts`

### Auth Flow

1. User visits `/login` → Google OAuth button
2. Callback handled by Better Auth at `/api/auth/[...all]/`
3. Domain verified in `hooks.after` middleware
4. Session stored in cookies via `nextCookies()` plugin
5. Protected routes check session in layout/page

### Components

- **Location:** `src/components/`
- **Current:** `LogoutButton.tsx`
- **Pattern:** PascalCase, named exports

### Styling

- Tailwind CSS v4 with `tailwind-variants` (`tv()`)
- `cn()` utility from `@frijolmagico/utils`
- Minimal custom styling (admin-focused)

### Database

- Uses `@frijolmagico/database` package
- Better Auth Drizzle adapter for user/session tables
- SQLite provider (Turso/libSQL)

## Environment Variables

```bash
# Auth
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Database (from root)
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
```

## Protected Routes

Dashboard and future admin pages should verify session server-side using `get-session.ts` helper.
