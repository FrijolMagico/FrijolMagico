## Tech Stack
- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4
- **Animation:** GSAP with ScrollTrigger
- **State:** Zustand
- **Analytics:** Vercel Analytics, Google Analytics

## Commands
```bash
bun run dev                    # Next.js dev with Turbopack
```

## Architecture

### App Router Structure
```
src/app/
├── (home)/                    # Home page with bento grid
├── (sections)/                # Route groups
│   ├── catalogo/              # Artist catalog
│   │   └── [slug]/            # Artist profile
│   ├── festivales/            # Festival pages
│   │   └── [slug]/            # Edition detail
│   └── nosotros/              # About page
├── api/                       # API routes
├── layout.tsx
└── not-found.tsx
```

### Section Pattern (Target)
**Target.** New sections follow this. Existing use `lib/` | `store/` | `constants/` | `schemas/` | `utils/`. Migrate when touched.

Folders are **on-demand** — only add what the section needs.

```
<section>/                        # Spanish — matches route name
├── adapters/                     # Infrastructure: DB, mocks, mapping
│   ├── <section>.repository.ts   # Data source (executeQuery, getDataSource)
│   ├── queries/
│   │   └── <section>.query.ts    # SQL strings
│   ├── mappers/
│   │   └── <section>.mapper.ts   # raw → domain transform
│   └── mocks/
│       └── <section>.mock.ts     # Fallback data
├── application/                  # Use-cases: orchestration + cache
│   ├── queries/
│   │   └── get-<section>.query.ts   # READ: 'use cache' + cacheTag
│   └── commands/
│       └── <verb>-<entity>.command.ts  # WRITE: create/update/delete
├── actions/                      # Next.js transport (Server Actions)
│   └── <verb>-<entity>.action.ts
├── stores/                       # Zustand client state
│   └── <section>.store.ts
├── types/
│   ├── <section>.ts              # Domain types
│   └── <section>-<aspect>.ts     # DB types, etc
├── components/                   # Section-local UI
├── layout.tsx                    # (optional)
├── page.tsx
└── [slug]/                       # Sub-section — REPLICATES full pattern
    ├── adapters/
    ├── application/
    ├── components/
    └── page.tsx
```

### Naming Rules
- **File prefix** = section name in English (`festival.mapper.ts`, `festival.repository.ts`, `get-catalog.query.ts`)

### Data Flow

```
READ: Page → application/queries → adapters/queries → mappers | mocks
WRITE: Action → application/commands → adapters/repository
```

### Components
- **Shared:** `src/components/` — Header, Footer, Grid, UI primitives, transitions
- **Section-local:** `app/(sections)/[section]/components/`
- **Pattern:** Named exports, props destructured in signature
- **Atomization:** Break down to smallest reusable pieces. No monolithic components.

## State Management
- Zustand in `stores/`. No business logic / use-cases.

## Styling
- Tailwind CSS v4 with `tailwind-variants` (`tv()`)

## Data Source
- **On Vercel:** `VERCEL_ENV` is truth. `DATA_SOURCE` ignored. Always real data.
- **Config:** `infra/config/dataSourceConfig.ts` controls source per module.
- **Mock fallback:** Internal to each repository. Not controlled by `DATA_SOURCE`.
