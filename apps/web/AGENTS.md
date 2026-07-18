## Tech Stack
- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **Animation:** GSAP with ScrollTrigger
- **State:** Zustand
- **Analytics:** Vercel Analytics, Google Analytics
## Commands
```bash
bun run dev                    # Next.js dev with Turbopack
bun run build                  # Production build
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # tsc --noEmit
bun run test                   # Run all tests through Turbo
```
## Architecture
### App Router Structure
```
src/app/
├── (home)/                    # Home page with bento grid
├── (sections)/                # Route groups
│   ├── catalogo/              # Artist catalog
│   ├── festivales/            # Festival pages
│   │   └── [edicion-slug]/    # Edition-based routing
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
2. **Data Sources:** Database (Turso), or local.db/Mock (dev)
3. **Mappers:** Transform raw data to domain models in `adapters/mappers/`
4. **Config:** `infra/config/dataSourceConfig.ts` controls source selection
### Component Pattern
Server component wrapper → Client component when need data from db:
```typescript
// Server component (no 'use client')
export const FestivalesTimeline = ({ data }) => {
  const data = getData() // Fetch data from the lib dal -> repo
  return <FestivalesTimelineClient data={data} />
}
// Client component
'use client'
export const FestivalesTimelineClient = ({ data }) => {
  // interactive logic
}
```
Be extremly atomic with client components.
### Components
- **Shared:** `src/components/` - Header, Footer, Grid, UI primitives
- **Section-local:** `app/(sections)/[section]/components/`
- **Pattern:** PascalCase, named exports, props destructured in signature
- **Client Components:** Only when interactivity is needed. Use `use client` directive.
- **Atomization**: Break down components to the smallest reusable pieces. Avoid large monolithic components.
## Imports
Order: React/Next → External → Workspace → Internal (`@/`) → Relative → Type imports
### State Management
- Zustand stores in `store/` directories
- Example: `useCatalogFiltersStore.ts`, `useCatalogPanelStore.ts`
### Styling
- Tailwind CSS v4 with `tailwind-variants` (`tv()`)
- `cn()` utility for conditional classes
