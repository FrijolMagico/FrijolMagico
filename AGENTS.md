# AGENTS.md - Frijol Magico

Monorepo configuration for agentic coding assistants.

**Generated**: 2026-02-11
**Mode**: Update

## Git Workflow

Feature PRs → `dev` (squash merge). Release PR `dev→main` se auto-genera — merge a main cierra issues automáticamente.

## Monorepo Structure

- **Turborepo** + Bun workspaces (`apps/*`, `packages/*`)
- **Apps:** `web` (port 3000), `admin` (port 3001)
- **Packages:** `database`, `ui`, `utils`, `eslint-config`, `typescript-config`, `tailwind-config`

## Root Commands

```bash
bun install                    # Install dependencies
bun run dev                    # Start all apps (Turbo)
bun run dev:real               # Dev with DATA_SOURCE=real
bun run build                  # Production build
bun run lint                   # ESLint all apps
bun run lint:fix               # ESLint with auto-fix
bun run test                   # Run all workspace tests through Turbo
bun run format                 # Prettier format
bun run type-check             # TypeScript check
bun run db:migrate             # Run DB migrations
```

## Testing

- Never run `bun test` from the repository root.
- Run the full suite from the repository root with `bun run test`.
- Run scoped tests from the repository root with `bun run test --filter=@frijolmagico/<workspace>` so Turbo preserves the workspace context.

## Code Style

- **Prettier:** No semicolons, single quotes (JSX too), 2-space indent, no trailing commas
- **Imports:** React/Next → External → Workspace (`@frijolmagico/*`) → Internal (`@/`) → Relative → Type imports
- **Naming:** PascalCase components (named exports), camelCase hooks with `use` prefix, UPPER_SNAKE_CASE constants
- **TypeScript:** Strict mode, `import type { X }` for type-only imports

## Forbidden Patterns

- **NEVER use barrel files** (`index.ts` exports) — import directly from source
- **NEVER default exports for components** — use named exports only
- **NEVER disable strict mode** — TypeScript strict is enforced
- **NEVER Pages Router** — App Router only for all new code

## Data Source

`DATA_SOURCE` env controls dev data:

| Value | Behavior |
|---|---|
| Not set | Intelligent defaults (mock for CMS, local DB for database) |
| `local` | Local SQLite. Some repos fall back to mock on query failure (internal fallback) |
| `real` | Production data sources |

> **Production (Vercel):** `DATA_SOURCE` is ignored. `VERCEL_ENV` is the sole source of truth. Always uses real data sources.

## App-Specific Agents

- [Web App](./apps/web/AGENTS.md)
- [Admin App](./apps/admin/AGENTS.md)

## Package-Specific Agents

- [Database](./packages/database/AGENTS.md)

## Security

- Never commit `.env` files or secrets
- Ask permission before destructive DB operations
