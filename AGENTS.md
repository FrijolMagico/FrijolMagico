# AGENTS.md - Frijol Magico

## Project Overview

Next.js 15 (App Router) web platform for the Frijol Magico Festival, showcasing illustrators from the Coquimbo Region, Chile. Built with React 19, TypeScript (strict), and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI**: React 19, TypeScript (strict mode), Tailwind CSS v4
- **State**: Zustand for client-side state
- **Animation**: GSAP with ScrollTrigger
- **Database**: Turso (libSQL) with Geni for migrations
- **CMS**: Google Sheets via google-spreadsheet library
- **Package Manager**: Bun (preferred)

## Build/Lint/Test Commands

```bash
bun install          # Install dependencies
bun run dev          # Development server (Turbopack)
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Lint code (ESLint)
bun run lint:fix     # Lint and auto-fix issues
bun run db:migrate   # Run pending migrations
bun run db:rollback  # Rollback last migration
bun run db:status    # Show pending migrations
bun run db:new       # Create new migration (e.g., bun run db:new add_users)
bun run db:seed      # Seed database
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
// 2. External libraries
import { create } from 'zustand'
import { Instagram } from 'lucide-react'
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

Return `{ data, error }` pattern from data fetching functions. Use `ErrorSection` component for displaying errors. Provide graceful fallbacks (empty arrays, default values).

```typescript
export async function getData(): Promise<{ data: Item[]; error: ErrorObject }> {
  try {
    const data = await repository()
    return { data, error: null }
  } catch (error) {
    console.error((error as Error).message)
    return { data: [], error: { message: 'Error message' } }
  }
}
```

## Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (home)/          # Home page route group
│   └── (sections)/      # Main sections (catalogo, festivales, convocatoria)
│       └── [section]/   # Each with: components/, store/, types/, lib/
├── components/          # Shared components (ui/, icons/)
├── config/              # App configuration
├── infra/               # Infrastructure (database adapters)
├── schemas/             # Zod validation schemas
├── styles/              # Global styles and palettes
├── types/               # Global TypeScript types
└── utils/               # Utility functions
db/
├── migrations/          # Database migrations (Geni)
└── seed/                # Seed data
```

## Key Patterns

- **Path Aliases**: Use `@/` for imports from `src/`
- **Styling**: Use custom color tokens (`text-fm-orange`, `bg-fm-white`) and `tailwind-variants`
- **Images**: Use Next.js `<Image />`, store in `public/sections/[section]/images/`
- **Data Fetching**: Prefer static generation, use mock data in development (`src/infra/__mocks__/`)

## Accessibility

- Use semantic HTML elements
- Provide `aria-label` for interactive elements
- Include alt text for all images
- ESLint jsx-a11y plugin enforces accessibility rules

## Verification Workflow

Before running `bun run build`, always follow this order:

1. Run `bun run lint` to check for linting errors
2. Ask the user to verify `bun run dev` looks correct visually
3. Only after user confirmation, proceed with `bun run build`

## Additional Resources

- See `.github/copilot-instructions.md` for detailed architectural patterns
