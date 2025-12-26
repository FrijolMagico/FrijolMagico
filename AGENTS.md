# AGENTS.md - Frijol Magico

## Project Overview

Frijol Magico is a Next.js 15 (App Router) web platform for the Frijol Magico Festival, showcasing illustrators from the Coquimbo Region, Chile. Built with React 19, TypeScript, and Tailwind CSS v4. Uses Google Sheets as CMS with Turso (libSQL) as the primary database.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI**: React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, tailwind-variants, clsx, tailwind-merge
- **State**: Zustand for client-side state
- **Animation**: GSAP with ScrollTrigger
- **Package Manager**: Bun (preferred) or npm
- **CMS**: Google Sheets via google-spreadsheet library
- **Database**: Turso (libSQL) with Geni for migrations

## Build/Lint/Test Commands

```bash
bun install          # Install dependencies
bun run dev          # Development server (with Turbopack)
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Lint code (ESLint + Prettier)
bun run db:migrate   # Run pending migrations
bun run db:rollback  # Rollback last migration
bun run db:status    # Show pending migrations
bun run db:new       # Create new migration (e.g., bun run db:new add_users)
bun run db:seed      # Seed database
bun run db:import    # Import data from Google Sheets
```

**Note**: No test framework is currently configured in this project.

## Code Style Guidelines

### Prettier Configuration

- No semicolons, single quotes (including JSX), trailing commas (all)
- 2-space indentation, bracket same line for JSX

### Import Order

Organize imports with blank lines between groups:

```typescript
// 1. React/Next.js
import { Suspense } from 'react'
import Image from 'next/image'
import type { Metadata } from 'next'
// 2. External libraries
import { create } from 'zustand'
import { Instagram, Mail } from 'lucide-react'
// 3. Internal absolute imports (@/)
import { cn } from '@/utils/utils'
import { Header } from '@/components/Header'
// 4. Relative imports
import { CatalogList } from './components/CatalogList'
// 5. Types (use 'type' keyword)
import type { CatalogArtist } from '../types/catalog'
```

### TypeScript Conventions

- **Strict mode enabled** - all code must be strongly typed
- Use `type` keyword for type-only imports: `import type { Foo } from './types'`
- Place global types in `src/types/`, section-specific types in `[section]/types/`
- Use descriptive interface names with suffixes: `Props`, `State`, `Config`

### Naming Conventions

| Element          | Convention            | Example                         |
| ---------------- | --------------------- | ------------------------------- |
| Components       | PascalCase            | `CatalogArtistCard.tsx`         |
| Hooks/Stores     | camelCase with prefix | `useCatalogFiltersStore.ts`     |
| Utilities        | camelCase             | `formatUrl`, `normalizeString`  |
| Constants        | UPPER_SNAKE_CASE      | `DEFAULT_FILTERS`               |
| Types/Interfaces | PascalCase            | `CatalogArtist`, `FilterValues` |

### Component Patterns

- Use **named exports** for components (not default exports)
- Mark client components with `'use client'` directive at top
- Destructure props directly in function signature
- Use `cn()` utility for conditional classnames:

```typescript
export const MyComponent = ({ isActive, className }: Props) => {
  return (
    <div className={cn('base-styles', { 'active-styles': isActive }, className)}>
      {/* content */}
    </div>
  )
}
```

### Zustand Store Pattern

```typescript
import { create } from 'zustand'
interface MyState {
  value: string
  setValue: (value: string) => void
}
export const useMyStore = create<MyState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}))
```

### Error Handling

- Return `{ data, error }` pattern from data fetching functions
- Use `ErrorSection` component for displaying errors
- Log errors to console with descriptive messages
- Provide graceful fallbacks (empty arrays, default values)

## Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (home)/          # Home page route group
│   ├── (sections)/      # Main sections (catalogo, festivales, convocatoria)
│   │   └── [section]/   # Each with: components/, store/, types/, lib/
│   └── layout.tsx
├── components/          # Shared components (ui/, icons/)
├── config/              # App configuration
├── data/                # Static data (site.json)
├── infra/               # Infrastructure (database adapters, importers)
├── schemas/             # Zod validation schemas
├── services/            # External service integrations
├── styles/              # Global styles and palettes
├── types/               # Global TypeScript types
└── utils/               # Utility functions

db/
├── migrations/          # Database migrations (Geni)
└── seed/                # Seed data
```

## Key Patterns

### Path Aliases

Use `@/` for imports from `src/`: `import { cn } from '@/utils/utils'`

### Styling with Tailwind

- Use custom color tokens: `text-fm-orange`, `bg-fm-white`, `text-fm-black`
- Use `tailwind-variants` for component variants

### Images

- Use Next.js `<Image />` component for all images
- Store images in `public/sections/[section]/images/`
- Always provide descriptive `alt` text

### Data Fetching

- Prefer static generation (build time) where possible
- Use mock data in development (`src/infra/__mocks__/`)
- Application reads from Turso database (data synced via `db:import`)

## Accessibility Requirements

- Use semantic HTML elements
- Provide `aria-label` for interactive elements
- Ensure keyboard navigation works
- Include alt text for all images

## Additional Resources

- See `.github/copilot-instructions.md` for detailed architectural patterns
- See `README.md` for project setup and environment variables
