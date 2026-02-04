# @frijolmagico/admin

Admin panel for Frijol Mágico Cultural Association. Built with Next.js 16, React 19, and TypeScript.

## Overview

The admin app provides a management interface for:

- **Artist Management**: View, edit, and manage artist profiles
- **Festival Management**: Create and manage festival editions
- **Open Calls**: Manage convocatorias and applications
- **User Management**: Admin user accounts and permissions (planned)
- **Content Management**: Manage CMS content via Google Sheets

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4
- **State**: Zustand for client-side state
- **Data**: Drizzle ORM with Turso Database
- **Auth**: Better Auth (planned)

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth-related routes
│   ├── (dashboard)/          # Main dashboard routes
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root page
├── components/               # Shared components
├── config/                   # Configuration
├── hooks/                    # Shared hooks
├── lib/                      # Library utilities
├── schemas/                  # Zod validation schemas
├── services/                 # Data fetching services
├── styles/                   # Global styles
├── types/                    # TypeScript types
└── utils/                    # Utilities
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

Create `.env.local` in `apps/admin/`:

```bash
# Required
TURSO_DATABASE_URL=https://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

## Key Dependencies

- `next` - Next.js 16
- `react` - React 19
- `@frijolmagico/database` - Workspace database package (with Drizzle ORM)
- `@frijolmagico/ui` - Workspace UI components
- `zustand` - State management
- `better-auth` - Authentication (planned)

## Database Integration

The admin app primarily uses the Drizzle ORM client for type-safe database operations:

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
  .values({
    pseudonimo: 'El Artista',
    slug: 'el-artista'
  })
  .returning()

// Update
await db.update(artista).set({ ciudad: 'Santiago' }).where(eq(artista.id, 1))
```

## Features

### Type-Safe Database Operations

Full Drizzle ORM integration with:

- Automatic type inference
- Relational queries
- Transactions support

### Admin Dashboard

- Overview of key metrics
- Quick actions for common tasks
- Recent activity feed

### Data Management

- CRUD operations for all entities
- Bulk operations
- Data validation with Zod schemas

## Routing

Using Next.js App Router with route groups:

- `(auth)` - Authentication routes (login, register)
- `(dashboard)` - Main admin interface

## Authentication (Planned)

Integration with Better Auth for:

- Google OAuth login
- Session management
- Role-based access control

## Styling

- Tailwind CSS v4
- Dark mode support (planned)
- Responsive design for desktop/tablet use

## Development

### Adding a New Admin Feature

1. Create route in `src/app/(dashboard)/`
2. Add page component with data fetching
3. Use Drizzle ORM for database operations
4. Add Zod schemas for validation

### Database Migrations

Run from root:

```bash
bun run db:migrate
```

Or from database package:

```bash
cd packages/database
bun run db:migrate
```

## Deployment

Deployed to Vercel alongside the web app:

- Separate deployment configuration
- Shared database via Turso
- Environment-specific variables

## Security Considerations

- Authentication required for all admin routes
- Database operations validated
- Input sanitization with Zod
- Environment variables for sensitive data

## See Also

- [Root README](../../README.md) - Project overview
- [AGENTS.md](../../AGENTS.md) - Development conventions
- [packages/database/README.md](../../packages/database/README.md) - Database docs
- [apps/web/README.md](../web/README.md) - Web app docs
