# AGENTS.md - Frijol Magico

Monorepo configuration for agentic coding assistants.

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
bun run format                 # Prettier format
bun run type-check             # TypeScript check
bun run db:migrate             # Run DB migrations
```

## Code Style

- **Prettier:** No semicolons, single quotes (JSX too), 2-space indent, no trailing commas
- **Imports:** React/Next → External → Workspace (`@frijolmagico/*`) → Internal (`@/`) → Relative → Type imports
- **Naming:** PascalCase components (named exports), camelCase hooks with `use` prefix, UPPER_SNAKE_CASE constants
- **TypeScript:** Strict mode, `import type { X }` for type-only imports

## Data Source

`DATA_SOURCE` env controls dev data:
- Not set: Intelligent defaults (mock for CMS, local DB for database)
- `real`: Production data sources
- `local`: Local SQLite

## App-Specific Agents

- [Web App](./apps/web/AGENTS.md)
- [Admin App](./apps/admin/AGENTS.md)

## Package-Specific Agents

- [Database](./packages/database/AGENTS.md)

## Security

- Never commit `.env` files or secrets
- Ask permission before destructive DB operations
