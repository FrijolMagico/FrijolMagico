# AGENTS.md - Web App

Main website (frijolmagico.cl) - Port 3000

**Generated**: 2026-02-11
**Mode**: Update

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **Animation:** GSAP with ScrollTrigger
- **State:** Zustand
- **CMS:** Google Sheets via `google-spreadsheet`
- **Analytics:** Vercel Analytics, Google Analytics

## Commands

```bash
bun run dev                    # Next.js dev with Turbopack
bun run build                  # Production build
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # tsc --noEmit
```

## Architecture

### App Router Structure

```
src/app/
├── (home)/                    # Home page with bento grid
├── (sections)/                # Route groups
│   ├── catalogo/              # Artist catalog
│   ├── festivales/            # Festival pages
│   │   └── (edicion)/2025/    # Edition-based routing
│   └── nosotros/              # About page
├── layout.tsx
└── not-found.tsx
```

### Section Pattern

Each section follows a consistent structure:

```
(sections)/[section]/
├── adapters/                  # Data repositories
│   ├── mappers/               # Data transformation
│   ├── mocks/                 # Mock data for dev
│   └── queries/               # SQL queries
├── components/                # Section components
├── constants/                 # Config & constants
├── lib/                       # Data fetching
├── store/                     # Zustand stores
├── types/                     # TypeScript types
├── utils/                     # Utilities
├── layout.tsx
└── page.tsx
```

### Data Flow

1. **Repository Pattern:** `adapters/[name]Repository.ts` handles data source logic
2. **Data Sources:** CMS (Google Sheets), Database (Turso), or Mock (dev)
3. **Mappers:** Transform raw data to domain models in `adapters/mappers/`
4. **Config:** `infra/config/dataSourceConfig.ts` controls source selection

### Key Features

- **Catalog:** Artist database with filtering, search, panel view
- **Festivales:** Edition-based festival pages with timeline, schedule
- **CMS Integration:** Google Sheets as headless CMS via `infra/services/googleSpreadsheetAdapter.ts`

### Animation

- GSAP ScrollTrigger for scroll-based animations
- `useGSAP()` hook in client components
- Avoid direct DOM manipulation; use refs

### Component Pattern

Server component wrapper → Client component:

```typescript
// Server component (no 'use client')
export const FestivalesTimeline = ({ data }) => {
  return <FestivalesTimelineClient data={data} />
}

// Client component
'use client'
export const FestivalesTimelineClient = ({ data }) => {
  // interactive logic
}
```

### Components

- **Shared:** `src/components/` - Header, Footer, Grid, UI primitives
- **Section-local:** `app/(sections)/[section]/components/`
- **Pattern:** PascalCase, named exports, props destructured in signature

## Imports

Order: React/Next → External → Workspace → Internal (`@/`) → Relative → Type imports

### State Management

- Zustand stores in `store/` directories
- Example: `useCatalogFiltersStore.ts`, `useCatalogPanelStore.ts`

### Styling

- Tailwind CSS v4 with `tailwind-variants` (`tv()`)
- `cn()` utility for conditional classes
- Custom colors: `fm-orange`, `fm-green`, `fm-black`, `fm-white`

## Data Source Config

Uses root `DATA_SOURCE` env:

- `mock`: Google Sheets mock data
- `local`: Local SQLite via Turso
- `database`: Production database
