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

- [x] **T2 — Redirect catalog aliases before streaming**
  - Added Next 16 `src/proxy.ts` using Node runtime + existing alias resolver; active aliases receive a real 308/Location before page render. Canonical precedence is protected by the resolver query and self-redirect guard; removed redundant page/metadata streamed redirects.
  - Tests: web suite 208 passed; type-check passed; lint passed with 3 unrelated warnings; independent verification clean.
  - Runtime: live alias request returned `HTTP/1.1 308 Permanent Redirect` and `Location: /catalogo/anima-blue`; forced build passed (2/2, 0 cached), Next reported `ƒ Proxy (Middleware)`, no DB fallback/bundling error. One existing metadataBase warning.
  - Work-unit commit `2aafb175` (`fix(web): redirect catalog aliases before streaming`).

- [x] **T3 — Deduplicate category-expanded editions in the artist timeline**
  - Kept the profile timeline's flat presentation while deduplicating one badge per event/edition/year; category detail remains intact in the `/catalogo` panel.
  - Tests: `bun run test --filter=@frijolmagico/web` passed (210 tests); type-check passed; lint passed with 3 unrelated warnings; independent verifier and parent spot-check clean.
  - Work-unit commit `91668a3a` (`fix(web): dedupe profile timeline editions`).

- [ ] **T4 — Run combined verification and browser smoke** (in progress)
  - Run `bun run test --filter=@frijolmagico/web`, `bun run type-check --filter=@frijolmagico/web`, `bun run lint --filter=@frijolmagico/web`, and `bun run build --force`.
  - Browser-smoke `/catalogo` panel, direct artist profile, and one alias; verify categorized badges with no duplicate-key console warning, alias returns HTTP 308 before content, and canonical slug loads.
  - Record checks and commit identities. Do not push/open PR.

## Progress and evidence

- Read-only diagnosis completed before implementation. The component key omitted `via_agrupacion`; the catalog query combines direct and collective rows with `UNION ALL` and currently drops participation categories. Direct exhibition + activity rows alone are combined by an `EXISTS`/edition group and are not sufficient to explain duplicate keys.
- Before T2, the slug page called server-side `permanentRedirect` after async data resolution; the streamed response was HTTP 200 containing Next `NEXT_REDIRECT` + meta refresh. Next 16.2.12 supports a Node-runtime `src/proxy.ts`; the new proxy now returns an early HTTP 308 with Location, verified on a live alias.
- T1 and T2 implementations are independently verified and committed: `32be480f` (badge groups), `2aafb175` (pre-stream alias redirect); task evidence commits `fb0829b5` and `1f75f054`.
- Browser smoke showed `/catalogo` panel as Festival → Ilustración/Narrativa Gráfica/Taller → edition/year with 0 console errors/warnings; alias browser navigation reached `/catalogo/anima-blue`, with direct curl 308 + canonical Location. The profile timeline separately emitted 3 duplicate-key warnings from repeated categorized edition rows; T3 now deduplicates that flat timeline, with 210 web tests and independent verification passing. T4 must repeat browser smoke after T3 and verify the warnings are gone.
