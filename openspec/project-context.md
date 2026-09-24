# FrijolMagico OpenSpec Project Context

## Repository

FrijolMagico is a Turborepo monorepo using Bun workspaces. It contains the Next.js 16 App Router applications `apps/admin` and `apps/web`, plus shared packages including `packages/database`, `packages/utils`, `packages/cache-tags`, and configuration packages.

## Conventions

- TypeScript strict; UI labels are Spanish and code/documentation artifacts are English.
- Prettier uses no semicolons, single quotes, two-space indentation, and no trailing commas.
- Components use named exports; `page.tsx` and `layout.tsx` are the documented default-export exceptions.
- App routes use Spanish route folders, while files, identifiers, and internal folders use English.
- Server-first Next.js architecture; admin uses authenticated Server Actions, Drizzle-Zod schemas, and feature `_actions`, `_components`, `_lib`, `_schemas`, `_types`, and `_store` folders.
- Database changes use Drizzle ORM/Turso and require explicit care for destructive migrations.

## Testing

- Primary runner: Bun test.
- Required monorepo command: `bun run test` (Turbo); do not use root `bun test`.
- Admin unit tests live under `apps/admin/tests/unit`; admin verification is `bun run type-check && bun run lint && bun test` from `apps/admin`.
- Web tests are colocated under `apps/web/src` as `.test.ts` and `.test.tsx`; web uses `bun test --isolate`.
- No Playwright configuration was detected during initialization.

## SDD Defaults

- Artifact store: OpenSpec files.
- Strict TDD: enabled for implementation phases.
- Execution mode: auto, with human-controlled consent and risk gates preserved.
- Delivery strategy: ask-on-risk.
- Review budget: 400 changed lines.
- Work Unit 3 is complete (15/40 tasks); Work Unit 4 is next. This repository-maintenance change does not implement Work Unit 4.

## Current Scope Context

Work Unit 3 is complete (15/40 tasks). Work Unit 4 is next: admin activity read-model registration joins, optional defaults/types/composer data, and registration fields for create/update forms. Consult the change's tasks and specs for the implementation contract; this maintenance change does not implement it. The feature concerns non-music edition activities, with registration URL and date range configured in admin and conditionally shown on web.

## Skills

Resolve available skills on the current device before future implementation or test work. The initialization device's `.atl/skill-registry.md` is ignored local state, not a portable source of skill paths.

## Initialization Notes

During initialization, CodeGraph reported the project as unindexed, so repository inspection used filesystem tools. Root `openspec/config.yaml` was created. The initialization device's local skill registry was left unchanged; it is not part of this portable OpenSpec context.
