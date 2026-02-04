# @frijolmagico/web

Main website for Frijol Mágico Cultural Association (frijolmagico.cl). Built with Next.js 16, React 19, and TypeScript.

## Overview

The web app serves as the digital hub for the Frijol Mágico Festival, featuring:

- **Home Page**: Festival announcements and featured content
- **Catalog**: Artist catalog with filters and search
- **Festivals**: Festival editions and event information
- **Open Calls**: Current and past convocatorias
- **About**: Organization information and team

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, GSAP animations
- **State**: Zustand for client-side state
- **Data**: Google Sheets (CMS) + Turso Database
- **Auth**: Better Auth (planned)

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (home)/               # Home page route group
│   ├── (sections)/           # Main sections
│   │   ├── catalogo/         # Artist catalog
│   │   ├── convocatoria/     # Open calls
│   │   ├── festivales/       # Festival pages
│   │   ├── nosotros/         # About page
│   │   └── quienes-somos/    # Who we are
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root page (redirects to home)
├── components/               # Shared components
│   ├── ui/                   # UI primitives
│   └── [section]/            # Section-specific components
├── config/                   # Configuration (paths, etc.)
├── hooks/                    # Shared hooks
├── infra/                    # Infrastructure adapters
│   ├── db/                   # Database adapters
│   └── sheets/               # Google Sheets integration
├── schemas/                  # Zod validation schemas
├── services/                 # Data fetching services
├── styles/                   # Global styles
├── types/                    # TypeScript types
└── utils/                    # Utilities
```

## Available Scripts

```bash
# Development
bun run dev                    # Start dev server with Turbopack (port 3000)
bun run dev:real               # Dev with DATA_SOURCE=real

# Build
bun run build                  # Production build
bun run start                  # Start production server

# Quality
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # TypeScript check
```

## Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Required
TURSO_DATABASE_URL=https://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GOOGLE_API_KEY=your_google_api_key
CATALOG_SHEET_ID=your_sheet_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
DATA_SOURCE=real              # Force production data sources
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
CDN_URL=your-cdn-url
```

## Data Sources

The app supports multiple data sources controlled by `DATA_SOURCE`:

- **Default**: Intelligent defaults (mock for CMS in dev, local DB for database)
- **DATA_SOURCE=real**: Always use production data
- **DATA_SOURCE=local**: Use local SQLite file

## Key Dependencies

- `next` - Next.js 16
- `react` - React 19
- `gsap` - Animation library with ScrollTrigger
- `zustand` - State management
- `google-spreadsheet` - Google Sheets API
- `lucide-react` - Icons
- `@frijolmagico/database` - Workspace database package
- `@frijolmagico/ui` - Workspace UI components

## Features

### Responsive Design

Mobile-first responsive design with Tailwind CSS v4.

### Animations

GSAP-powered animations including:

- Scroll-triggered animations
- Page transitions
- Micro-interactions

### SEO

- Automatic sitemap generation via `next-sitemap`
- Meta tags and Open Graph
- Structured data

### Performance

- Static generation for most pages
- Image optimization with Next.js Image
- Code splitting

## Routing

Using Next.js App Router with route groups:

- `(home)` - Home page and layout
- `(sections)` - Main content sections

## State Management

Zustand stores located in `src/app/(sections)/[section]/store/`:

- `useCatalogFiltersStore.ts` - Catalog filtering state
- Section-specific stores for complex state

## Styling

- Tailwind CSS v4 with custom theme tokens
- CSS variables for dynamic theming
- `[data-palette]` attributes for context-specific styling

## Development

### Adding a New Section

1. Create folder in `src/app/(sections)/`
2. Add `page.tsx` and `layout.tsx`
3. Create section-specific components in `src/components/[section]/`
4. Add types to `src/types/` or section folder

### Database Integration

Use workspace database package:

```typescript
import { executeQuery } from '@frijolmagico/database/client'

const { data, error } = await executeQuery(
  'SELECT * FROM artista WHERE estado_id = ?',
  [1]
)
```

Or for type-safe queries with Drizzle ORM:

```typescript
import { db } from '@frijolmagico/database/orm'
import { artista } from '@frijolmagico/database/schema'

const artistas = await db.select().from(artista)
```

## Deployment

Deployed to Vercel with:

- Automatic deployments on push to main
- Preview deployments for PRs
- Edge functions for dynamic routes

## See Also

- [Root README](../../README.md) - Project overview
- [AGENTS.md](../../AGENTS.md) - Development conventions
- [packages/database/README.md](../../packages/database/README.md) - Database docs
