# @frijolmagico/admin

Admin panel for Frijol Mágico Cultural Association. Built with Next.js 16, React 19, and TypeScript.

## Overview

The admin app provides a protected management interface for:

- **Dashboard**: Overview and quick actions
- **Artist Management**: View and manage artist profiles (planned)
- **Festival Management**: Manage festival editions (planned)
- **User Management**: Admin accounts via Better Auth

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4
- **Auth**: Better Auth with Google OAuth
- **Data**: Drizzle ORM with Turso Database via `@frijolmagico/database`

## Project Structure

```
src/
├── app/                       # Next.js App Router
│   ├── api/auth/[...all]/     # Better Auth API routes
│   ├── auth/lib/              # Auth configuration
│   │   ├── auth.ts            # Better Auth config
│   │   ├── auth-client.ts     # Client-side auth
│   │   └── get-session.ts     # Server session helper
│   ├── dashboard/             # Protected dashboard
│   ├── login/                 # Login page
│   ├── layout.tsx
│   └── page.tsx               # Redirects to dashboard
├── components/                # Shared components
├── lib/                       # Utilities
├── styles/                    # Global styles
└── types/                     # TypeScript types
```

## Available Scripts

```bash
# Development
bun run dev                    # Start dev server with Turbopack (port 3001)

# Build
bun run build                  # Production build
bun run start                  # Start production server

# Quality
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # TypeScript check
```

## Environment Variables

See `.env.example` in this directory for all required and optional environment variables.

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Key variable categories:
- **Turso Database**: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- **Better Auth**: `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Note:** Do not commit `.env.local` with secrets. Keep it in `.gitignore`.

## Authentication

Better Auth with Google OAuth:

- **Provider**: Better Auth with Drizzle adapter
- **Method**: Google OAuth only (no email/password)
- **Restriction**: Only `@frijolmagico.cl` domain allowed
- **Session**: 3-day expiration, 24-hour update age

### Auth Flow

1. User visits `/login` → Google OAuth button
2. Callback handled by Better Auth at `/api/auth/[...all]/`
3. Domain verified in middleware
4. Session stored in cookies
5. Protected routes check session via `get-session.ts`

### Protecting Routes

```typescript
import { auth } from '@/app/auth/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if (!session) {
    redirect('/login')
  }
  
  // ...
}
```

## Database Integration

Uses Drizzle ORM client for type-safe operations:

```typescript
import { db } from '@frijolmagico/database/orm'
import { artista } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

// Query with relations
const artistas = await db.query.artista.findMany({
  with: {
    imagenes: true,
    estado: true
  }
})

// Insert
const [nuevo] = await db
  .insert(artista)
  .values({ pseudonimo: 'El Artista', slug: 'el-artista' })
  .returning()
```

## Security

- Authentication required for all admin routes
- Domain restriction to `@frijolmagico.cl`
- Database operations validated
- Input sanitization with Zod

## Deployment

Deployed to Vercel alongside the web app:
- Separate deployment configuration
- Port 3001 in development

## See Also

- [Root README](../../README.md) - Project overview
- [AGENTS.md](../../AGENTS.md) - Monorepo conventions
- [Admin AGENTS.md](./AGENTS.md) - Admin app detailed conventions
- [packages/database/README.md](../../packages/database/README.md) - Database docs
- [Better Auth Docs](https://www.better-auth.com/)
