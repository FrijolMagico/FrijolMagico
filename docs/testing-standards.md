# Testing Standards

Standards for unit tests across this monorepo: per-file isolation, the approved
surface for `mock.module()`, and the test-double rules that keep `mock.module`
honest.

## Test runner

Both apps run their unit tests with the **Bun test runner** (`bun:test`). There
is no Vitest/Jest anywhere in this repository.

- Files mirror the source tree under `apps/<app>/tests/unit/` (admin) or live
  next to the source in `src/` (web).
- Run a single app with `bun run test --filter=@frijolmagico/<app>`.
- Never run `bun test` directly from the root — it bypasses Turbo and breaks the
  workspace script graph.

## Per-file isolation

Isolation is **mandatory** and **always on**. A mock registered by one test file
must never leak into another file.

- The `test` script of **every app** must be `bun test --isolate`.
- The CI guard (`Enforce per-file test isolation` in `pr-checks.yml`) fails the
  build if any app's script drops `--isolate` or if a dead `isolate` key sneaks
  back into a `bunfig.toml`.
- `isolate = true` in `bunfig.toml` **does not work**. It is an unsupported key
  that Bun silently ignores. Only the CLI flag `--isolate` actually isolates.
- Never register `mock.module` in a **preload** file (`test-setup.ts`). Preloads
  run once per worker and their mocks leak into every file in that worker —
  even with `--isolate`. Mocks belong to the test file that needs them.

## `mock.module` — approved surface

`mock.module` is reserved for **infrastructure boundaries**. These are safe to
mock because they are transport/IO seams, not domain logic:

| Category                   | Examples                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Next.js server guards      | `server-only`                                                                                  |
| Next.js cache/navigation   | `next/cache`, `next/cache.js`, `next/navigation`                                               |
| External SDKs / packages   | `@aws-sdk/*`, `drizzle-orm`, `sonner`                                                          |
| Database clients           | `@frijolmagico/database/orm`, `@frijolmagico/database/schema`, `@frijolmagico/database/client` |
| Auth / session utils       | `@/shared/lib/auth/utils`                                                                      |
| Data source config         | `@/infra/config/dataSourceConfig`                                                              |
| Cache invalidation helpers | `@/shared/lib/web-invalidation`                                                                |

### Full-surface rule

A `mock.module` of a **first-party module must cover the complete surface** of
the real module. A missing export resolves to `undefined` silently, which turns
a "real value" bug into a confusing `Type is not a function` failure far from
the cause.

Before writing a mock, read the real module and enumerate every export. Keep the
mock's shape in sync when the real module grows.

**Documented exception:** partial mocks are allowed only for large/external
packages or explicitly justified helpers. In this repo:

- `drizzle-orm` is mocked partially (the action under test only imports
  `max`).
- `@/core/artistas/catalogo/_schemas/catalog.schema` is mocked partially when
  the test only exercises `safeParse`.

## Restrictions — never mock domain hooks

Never use `mock.module` on **domain hooks**:

- Server actions under `_actions/*`
- DAL modules under `_lib/*`
- Use-cases
- Cron logic (`(cron)/_lib/*`)

These carry the business rules of the app. Mocking them hides the rules instead
of testing them. Use one of these instead:

1. **Dependency injection** — pass dependencies as parameters or factories into
   the code under test. Preferred. Canonical example: the asset operation policy
   receives its IO seam by factory —
   `createArtistAvatarOperationPolicy({ fetch })` in
   `apps/admin/src/app/(core)/artistas/catalogo/_lib/artist-avatar-operation-policy.ts` —
   the policy never imports `fetch`; the test injects a capture stub and the
   production composition binds `globalThis.fetch`.
2. **Test doubles at the boundary** — mock the infrastructure the domain hook
   depends on (DB client, auth utils, cache) and assert against the real hook.

If you must `mock.module` a domain module (DI is not viable), the mock must live
**at top level** with the **full surface**, followed by `await import()` of the
SUT. `mock.module` inside a `test()` body is **prohibited**: module registration
is not re-evaluated per test, so the mock silently applies to the wrong scope.

### Transport-edge delegation (route tests only)

Route handlers (`app/**/api/**/route.ts`, cron endpoints) are **transport
edges**: they parse requests, validate input, call a server action or `_lib`
routine, and shape the response. A route test that mocks that delegation is
**allowed only when all of these hold**:

- The file under test is a route handler (never a `_lib`/`_actions` module
  being tested directly).
- The test focuses on transport behavior (parsing, validation, status codes,
  response shape, auth guard) — not on the delegated business rules.
- The mock is **top level** with the **full surface** of the real module.
- The delegated module keeps its own coverage through boundary test doubles.

This carve-out exists so route tests do not need an in-memory copy of the whole
domain stack; it does not weaken the prohibition for `_lib`/`_actions` tests.

## Shape rules

- `mock.module` calls are always **top level** — Bun hoists them above imports.
- If you mock `next/cache`, also mock `next/cache.js` (the resolver can hit
  either specifier; only mocking one is flaky).
- Standardize the DB client mock style across web tests via the shared
  `@/test-utils/mockDatabase` helper (proxy over `mock(realFn)`), rather than
  hand-rolling per-file stubs.
- Do not call `mock.restore()` globally at top level without a documented
  justification (see `create-catalog.action.test.ts` for the sanctioned
  pattern).

## Regression guards

Each app ships a pair of guard files that prove `mock.module` does **not**
leak across files:

- `module-mock-source.test.ts` — registers a mock for an approved module and
  asserts the SUT **sees** it.
- `module-mock-leak-guard.test.ts` — imports the same module **without**
  registering a mock and asserts it gets the **real** functions (no Bun mock
  API attached).

These guards are only deterministic under `--isolate`. Without isolation, the
guard passes or fails depending on which file the worker ran first — which is
exactly the bug they exist to catch.

## Category summary

| Category       | What it means                                                                                 | Examples from this repo                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Approved**   | Infrastructure boundaries — mock freely, full surface                                         | `server-only`, `next/cache`, `@/shared/lib/auth/utils`, `@/infra/config/dataSourceConfig`, `@frijolmagico/database/orm` |
| **Restricted** | Large/external packages or justified helpers — partial mock allowed with documented rationale | `drizzle-orm` (`max` only), `catalog.schema` (`safeParse` only)                                                         |
| **Prohibited** | Domain hooks — never `mock.module`; use DI/test doubles instead | `_actions/*`, `_lib/*`, use-cases, `(cron)/_lib/*` (exception: transport-edge delegation in route tests, see above) |
