# @frijolmagico/web

Main website for Frijol Mágico Cultural Association (frijolmagico.cl). Built with Next.js 16, React 19, and TypeScript.

## Overview

The web app serves as the digital hub for the Frijol Mágico Festival, featuring:

- **Home Page**: Bento grid with festival announcements and featured content
- **Catalog**: Artist catalog with filters, search, and panel view
- **Festivals**: Festival editions with timeline, schedule, and participant info
- **Open Calls**: Convocatorias for festival participation
- **About**: Organization information

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, GSAP animations
- **State**: Zustand for client-side state
- **Data**: Google Sheets (CMS) + Turso Database via `@frijolmagico/database`
- **Analytics**: Vercel Analytics, Google Analytics, SpeedInsights

## Project Structure

```
src/
├── app/                       # Next.js App Router
│   ├── (home)/                # Home page route group
│   │   ├── components/        # Home-specific components
│   │   └── page.tsx
│   ├── (sections)/            # Main content sections
│   │   ├── catalogo/          # Artist catalog
│   │   ├── convocatoria/      # Open calls
│   │   ├── festivales/        # Festival pages
│   │   └── nosotros/          # About page
│   ├── layout.tsx
│   └── not-found.tsx
├── components/                # Shared components
├── config/                    # Configuration
├── hooks/                     # Shared hooks
├── infra/                     # Infrastructure adapters
│   ├── config/                # Data source config
│   └── services/              # Google Sheets adapter
├── schemas/                   # Zod validation schemas
├── styles/                    # Global styles
├── types/                     # TypeScript types
└── utils/                     # Utilities
```

## Available Scripts

```bash
# Development
bun run dev                    # Start dev server with Turbopack (port 3000)

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
- **Google Sheets**: `GOOGLE_API_KEY`, sheet IDs for catalog and festivals
- **Analytics**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Data Source**: `DATA_SOURCE` (controls mock/real data in development)

## Data Sources

The app supports multiple data sources controlled by `DATA_SOURCE`:

- **Default**: Intelligent defaults (mock for CMS in dev, local DB for database queries)
- **DATA_SOURCE=real**: Always use production data
- **DATA_SOURCE=local**: Use local SQLite file

## Section Pattern

Each section follows a consistent architecture:

```
(sections)/[section]/
├── adapters/         # Repository pattern - data source logic
│   ├── mappers/      # Data transformation
│   ├── mocks/        # Development mock data
│   └── queries/      # SQL queries
├── components/       # Section-specific components
├── constants/        # Config and constants
├── lib/             # Data fetching functions
├── store/           # Zustand stores
├── types/           # TypeScript types
├── utils/           # Utilities
├── layout.tsx
└── page.tsx
```

## Animation

GSAP ScrollTrigger for scroll-based animations:

```typescript
'use client'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

useGSAP(() => {
  gsap.from('.element', {
    scrollTrigger: { trigger: '.element', start: 'top 80%' },
    opacity: 0,
    y: 50
  })
})
```

## Features

### Responsive Design

Mobile-first responsive design with Tailwind CSS v4.

### SEO

- Automatic sitemap generation via `next-sitemap`
- Meta tags and Open Graph
- Structured data

### Performance

- Static generation for most pages
- Image optimization with Next.js Image
- Code splitting with Turbopack

## Deployment

Deployed to Vercel with:

- Automatic deployments on push to main
- Preview deployments for PRs

## See Also

- [Root README](../../README.md) - Project overview
- [AGENTS.md](../../AGENTS.md) - Monorepo conventions
- [Web AGENTS.md](./AGENTS.md) - Web app detailed conventions
- [packages/database/README.md](../../packages/database/README.md) - Database docs
