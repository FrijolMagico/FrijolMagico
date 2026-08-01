# Testing Architecture

Admin unit tests run with the **Bun test runner** (`bun:test`). There is no
Vitest/Jest setup in this repo anymore.

## Structure

Tests mirror the source tree under `tests/unit/`:

```text
tests/unit/
├── app/                    # Mirrors src/app (routes, actions, DAL, cron)
│   ├── (core)/
│   │   ├── api/
│   │   ├── artistas/
│   │   └── eventos/
│   └── (cron)/
└── shared/                 # Mirrors src/shared (components, lib, ui)
```

- **Naming:** `.test.ts` / `.test.tsx` files next to their mirrored source path.
- **Imports:** use the `@/` alias and the absolute source paths under test.

## Running Tests

```bash
# Scoped to this app (through Turbo)
bun run test --filter=@frijolmagico/admin

# Directly (without Turbo)
bun test --isolate
```

The `test` script **must** run `bun test --isolate`. Per-file isolation is
mandatory: a `mock.module` registered in one file must never leak into another.
A CI guard enforces this; see `docs/testing-standards.md`.

## Mocking

- `mock.module` is reserved for infrastructure boundaries (DB clients, auth
  utils, `next/cache`, `server-only`, etc.).
- First-party mocks must cover the **full surface** of the real module.
- Domain hooks (server actions, DAL, use-cases, cron logic) are **never**
  mocked with `mock.module` — use dependency injection or test doubles.

See **[`docs/testing-standards.md`](../../docs/testing-standards.md)** for the
complete standard: approved categories, the full-surface rule, the DI pattern,
shape rules, and the per-app regression guards.
