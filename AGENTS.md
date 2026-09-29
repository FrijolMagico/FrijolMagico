## Git Workflow
- **No PR directo a `main`.** Solo `dev→main` vía release PR.
- **Commits:** conventional commits (`type(scope): description`). No AI attribution.
- **No direct dev commits.** Branch per scope. PR to `dev`.
- **Feature PRs** → `dev` (squash merge).
- **Release** `dev→main` auto-gen. Merge main → close issues.
- **Version labels:** Tag every PR with `major`, `minor`, or `patch`. Release CI reads it for version bump.
## Monorepo Structure
- **Turborepo** + Bun workspaces (`apps/*`, `packages/*`)
- **Apps:** `web` (port 3000), `admin` (port 3001)
- **Packages:** (import as `@frijolmagico/<name>` with `workspace:*` in package.json)
  - `database` — Drizzle ORM client + schema + raw SQL client
  - `utils` — Utilities (cn, css, string, url, rrss, version, cdn, shallow-diff)
  - `cache-tags` — Next.js cache tag constants
  - `eslint-config` — ESLint config (extends Next.js)
  - `typescript-config` — Base TypeScript config (strict)
  - `tailwind-config` — Tailwind CSS config + brand palettes
## Root Commands
```bash
bun install
bun run dev
bun run build
bun run lint
bun run lint:fix
bun run test
bun run format
bun run type-check
bun run db:migrate
```
## Testing
- Use `bun run test` (Turbo). Never `bun test` — bypasses Turbo, breaks workspace.
- Scoped: `bun run test --filter=@frijolmagico/<workspace>`.
## Code Style
- **Prettier:** [./.prettierrc](./.prettierrc) — no semi, single quotes (JSX too), 2-space indent, no trailing commas
- **Imports:** React/Next → External → Workspace (`@frijolmagico/*`) → Internal (`@/`) → Relative → Type imports
- **Naming:** Component files kebab-case (`user-profile.tsx`), component exports PascalCase (named), camelCase hooks with `use` prefix, UPPER_SNAKE_CASE constants
- **`cn()`** for conditional Tailwind class merging
- **TypeScript:** Strict mode, `import type { X }` for type-only imports
## Forbidden Patterns
- Barrel files (`index.ts` exports) — import directly from source
  - Exception: `packages/database/src/db/schema/index.ts` (Drizzle Kit)
- Default exports for components — use named exports only
- Disable strict mode
- `any`, `as any`, `@ts-ignore`, `@ts-expect-error` — fix the type properly
- `eslint-disable` to silence lint errors (dev approval only for unavoidable)
## App Rules
- [App Shared Rules](./apps/AGENTS.md)
- [Web App](./apps/web/AGENTS.md)
- [Admin App](./apps/admin/AGENTS.md)
## Package-Specific Agents
- [Packages](./packages/AGENTS.md) — conventions for creating new packages
- [Database](./packages/database/AGENTS.md) — Drizzle ORM + Turso
- [Utils](./packages/utils/AGENTS.md) — pure utility functions
- [Cache Tags](./packages/cache-tags/AGENTS.md) — cache tag constants + helpers
## Security
- No `.env`, secrets, API keys, tokens, connection strings
- No hardcoded credentials, auth tokens, passwords
- **Destructive DB operations:** Ask permission first.
- **`NEXT_PUBLIC_*`:** Never use for secrets. Only for public config values.
- **Agents/subagents:** See bad architecture or duplicate code in scope? Tell user, propose fix; stay alert for tech debt on your path.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
