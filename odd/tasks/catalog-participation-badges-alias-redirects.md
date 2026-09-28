# Catalog participation badges and alias redirects

## Objective

Fix duplicate festival edition badges by preserving and displaying real participation categories, and prevent catalog alias redirects from briefly rendering the old route before reaching its canonical slug.

## Context and constraints

- Worktree: `/home/strocs/dev/FrijolMagico`, branch `feat/artist-pseudonyms`.
- User explicitly authorized both fixes after read-only diagnosis. The user proposed a hierarchy of festival → participation type/category → edition badges (e.g. illustration, narrative, workshop, talk).
- Exhibition category comes from `disciplina.slug`; activity category comes from `tipo_actividad.slug`. Keep those as distinct kinds even if their display labels happen to match.
- Preserve the existing visible-status filter (`confirmado`, `completado`) and catalog pseudonym behavior.
- Deduplicate the same category + event-edition badge when duplicate rows come through direct and collective participation paths; multiple real categories for one event edition must remain visible.
- Catalog alias behavior must return a permanent redirect before the old page begins streaming; canonical routes remain unchanged and aliases for unavailable catalog entries must not redirect.
- No schema/database migration, no production DB writes, no unrelated UI redesign. Preserve `odd/tasks/participation-status-visibility.md`.
- No push or PR. Local work-unit commits are authorized by the existing feature constraints.
- TDD is not activated. Workspace runner: `bun run test --filter=@frijolmagico/web`; also type-check/lint/build as scoped below. RDD off.

## Tasks

- [x] **T1 — Group catalog edition badges by participation category**
  - Extended query/schema data flow with exhibition discipline and activity-type categories; rendered festival → category → edition/year groups with stable keys; deduplicated duplicate category-edition rows across direct/collective paths.
  - Tests: `bun run test --filter=@frijolmagico/web` passed (202 tests); type-check passed; lint passed with 3 existing warnings in unrelated files; independent verifier found no mismatch. Parent spot-check passed; `git diff --check` passed.
  - Work-unit commit `32be480f` (`feat(web): group catalog participation badges`).

- [ ] **T2 — Redirect catalog aliases before streaming** (in progress)
  - Use a Next 16 request-stage mechanism compatible with the web app and database client to resolve aliases and issue an HTTP 308 with `Location` before page content streams.
  - Keep canonical slugs untouched; inactive/missing aliases do not redirect. Avoid redundant page/metadata redirect work if the new layer safely owns it.
  - Add tests for the request-stage redirect decision and verify a real alias response has status 308 + canonical `Location`, not a streamed HTTP 200/meta refresh.
  - Checks: focused redirect tests, web type-check/lint.
  - Route: bounded implementation after T1 closes, independently verified.

- [ ] **T3 — Run combined verification and browser smoke**
  - Run `bun run test --filter=@frijolmagico/web`, `bun run type-check --filter=@frijolmagico/web`, `bun run lint --filter=@frijolmagico/web`, and `bun run build --force`.
  - Browser-smoke `/catalogo` and one alias; verify category groups/unique badges, alias responds directly with canonical redirect, and canonical slug still loads.
  - Record checks and commit identities. Do not push/open PR.

## Progress and evidence

- Read-only diagnosis completed before implementation. The component key omitted `via_agrupacion`; the catalog query combines direct and collective rows with `UNION ALL` and currently drops participation categories. Direct exhibition + activity rows alone are combined by an `EXISTS`/edition group and are not sufficient to explain duplicate keys.
- The slug page currently calls server-side `permanentRedirect` after async data resolution; the live streamed response was HTTP 200 containing Next `NEXT_REDIRECT` + meta refresh, explaining the visible intermediate old route. A request-stage redirect must be confirmed against the installed Next 16 runtime before writing it.
- T1 implementation is complete and independently verified; its worktree changes are ready for a local work-unit commit. T2 remains to confirm the installed Next 16 request-stage API and implement/test a true pre-streaming HTTP 308.
