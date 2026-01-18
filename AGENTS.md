# AGENTS.md - Frijol Magico (Agent Guidance)

## Purpose

This file contains concise, actionable rules and conventions for agentic coding assistants working in this repository. It collects build/test commands, code-style expectations, workspace structure, and operational rules agents must follow.

## Tech Stack

- Framework: Next.js 16 (App Router) with Turbopack
- UI: React 19, TypeScript (strict mode), Tailwind CSS v4
- State: Zustand
- Animation: GSAP with ScrollTrigger
- Database: Turso (libSQL) with Geni migrations
- CMS: Google Sheets via `google-spreadsheet`
- Package manager: Bun (preferred)

## Build / Lint / Test Commands

Primary scripts (see `package.json`):

- `bun install` — install dependencies (preferred)
- `bun run dev` — development server (Turbopack)
- `bun run build` — production build
- `bun run start` — start production server
- `bun run lint` — run ESLint on `src/`
- `bun run lint:fix` — run ESLint with `--fix`

Database commands (via Geni/Turso):

- `bun run db:migrate` — run pending migrations
- `bun run db:rollback` — rollback last migration
- `bun run db:status` — show migration status
- `bun run db:new <name>` — create new migration
- `bun run db:seed` — run seed.sql against configured Turso DB

Testing notes

- Currently no test framework is configured in the repo.
- Recommended test stack for agents making test changes: Vitest + Testing Library (fast, works well with Bun). If adding tests, add scripts to `package.json` like:
  - `test` -> `vitest` (or `bun run vitest`)
  - `test:run` -> `vitest run`
  - `test:watch` -> `vitest`

How to run a single test (examples):

- Vitest (recommended):
  - `bun run vitest -- tests/path/to/file.test.ts` or `bun run vitest -- -t "test name"`
  - `npx vitest run tests/path/to/file.test.ts`
- Jest (if introduced):
  - `npx jest tests/path/to/file.test.ts` or `npx jest -t "test name"`
- Playwright (for E2E):
  - `npx playwright test tests/e2e/spec.spec.ts -g "test name"`

Agents: If you add tests, also add appropriate `devDependencies` and `package.json` scripts and document them here.

## Repository Notes for Agents

- Read `package.json` before changing scripts (`package.json`: `dev`, `build`, `lint`, `db:*`).
- If you modify database migration/seed files, follow the DB Data Management rules below and always ask for explicit user consent before running destructive DB operations.
- Consult `.github/copilot-instructions.md` for high-level architectural guidance; agents should not overwrite that file without maintainers' approval.

## Code Style Guidelines

Formatting / Prettier

- Prettier config: no semicolons, single quotes (including JSX), 2-space indent, no trailing commas.
- Use `prettier-plugin-tailwindcss` to keep class names ordered.
- Format on save or run the configured Prettier task.

Imports

- Group imports with blank lines between groups in this order:
  1. React / Next.js
  2. External libraries
  3. Internal absolute imports (alias `@/` for `src/`)
  4. Relative imports
  5. Type-only imports (`import type { ... } from '...'`)
- Example:
  - `import { Suspense } from 'react'`
  - `import Image from 'next/image'`
  - `import { create } from 'zustand'`
  - `import { cn } from '@/utils/utils'`
  - `import { LocalComponent } from './components/LocalComponent'`
  - `import type { MyType } from '@/types'`

TypeScript conventions

- Project uses strict TypeScript. Do not disable `strict` or `noImplicitAny` locally.
- Use `type` keyword for type-only imports and exports: `import type { X } from '...'`.
- Global types: `src/types/`.
- Section-specific types: `[section]/types/` inside its route folder.
- Prefer small, composable types over large ad-hoc interfaces. Use Zod schemas for runtime validation where necessary.

Naming conventions

- Components: PascalCase (e.g., `CatalogArtistCard.tsx`). Use named exports, not default exports.
- Hooks / stores: camelCase with prefix `use` (e.g., `useCatalogFiltersStore.ts`).
- Utilities: camelCase (e.g., `formatUrl`).
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_FILTERS`).
- Types / interfaces: PascalCase (e.g., `CatalogArtist`).

React / Component patterns

- Use App Router (`src/app/`). Prefer server components by default; mark client components with `'use client'` at the top.
- Destructure props in the function signature.
- Keep components small and focused. Move shared UI into `src/components/`.
- Use `cn()` utility for conditional classnames.
- Avoid direct DOM manipulation; use refs and GSAP where needed for animations.

State management (Zustand)

- Use the repo's established Zustand pattern:
  - `export const useStore = create<MyState>((set) => ({ ... }))`
- Keep stores minimal and focused on UI state; persist only when necessary.

Styling / Tailwind

- Use Tailwind v4 tokens and `tailwind-variants` for component variants.
- Keep long class lists organized via `tv()` utilities or `cn` helpers.
- Place global styles in `src/styles/`.

Error handling

- Data-fetching functions should return the `{ data, error }` shape: `{ data: T | null, error: ErrorObject | null }`.
- Log errors with `console.error()` for server-side operations, and use a user-friendly `ErrorSection` component on the UI.
- Provide safe fallbacks (empty arrays, sensible defaults) to avoid runtime crashes.

Security and Secrets

- Never commit secrets or `.env` values. Use environment files and `.env.local` which must be kept out of git.
- When an agent must run commands that require credentials (db migrations, seeds), ask the user for permission.

Accessibility

- Use semantic HTML elements and `aria-*` attributes where appropriate.
- Provide `alt` text for all images. Lint rules include `jsx-a11y` plugin.

## Directory Structure (short)

- `src/app/` — Next.js App Router
- `src/components/` — shared UI
- `src/config/` — configuration
- `src/infra/` — infra/database adapters
- `src/schemas/` — Zod schemas
- `src/styles/` — global styles
- `src/types/` — global types
- `db/migrations/`, `db/seed/` — DB migrations & seed files

## Database Data Management (agents)

- Non-seed data insertions: create a new numbered SQL file in `db/data/` (e.g., `013_insert_users.sql`). Do not execute these without explicit user consent.
- Seeds in `db/seed/` are reserved for catalog/system data only.
- For structural schema changes, run `PRAGMA foreign_key_list(table_name)` to inspect relations, backup `db/dump.sql`, and obtain user consent before applying destructive migrations.

## Tests & CI (agent guidance)

- There are no tests by default. If you add a test framework, update this file and `package.json` with scripts for:
  - running all tests
  - running a single test
  - running tests in watch mode
- When adding CI (GitHub Actions), keep jobs minimal: install deps, lint, build, and run tests. Prefer cache for Bun/Node modules.

## Copilot / Cursor Rules

- Copilot rules: see `.github/copilot-instructions.md` for architectural patterns and conventions — agents should consult it for higher-level guidance.
- Cursor rules: no `.cursor` rules found in the repo. If introduced, add a section here summarizing them.

## Operational Rules for Agents

- Always read relevant files before editing them (we already applied this rule).
- When making code changes:
  - Keep changes minimal and focused to solve the stated task.
  - Do not run destructive commands (e.g., `git reset --hard`, force pushes) without user approval.
  - Do not commit changes unless the user explicitly requests it. If asked to commit, produce a concise commit message focusing on the why.
- Before running `bun run build`, run `bun run lint` and ask the user to verify `bun run dev` visually if UI changes are involved.

## If you modify this file

- Keep this file concise and actionable. Mention any new tooling (tests, linters) and how to run a single test.
- If you change build/test scripts, update the `package.json` and document the new commands here.

---

For further project-specific clarifications, consult `README.md` and `.github/copilot-instructions.md`.
