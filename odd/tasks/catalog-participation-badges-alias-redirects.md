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

- [x] **T4 — Run combined verification and browser smoke**
  - `bun run test --filter=@frijolmagico/web`: 210 passed; web type-check passed; lint passed with 3 pre-existing warnings outside catalog; `bun run build --force`: 2/2 tasks, 0 cached, no DB fallback, 2 existing `metadataBase` warnings.
  - Browser: `/catalogo` showed Festival → Ilustración/Narrativa Gráfica/Taller → edition/year; profile showed one badge per edition; both had 0 console errors/warnings. Alias navigation ended at `/catalogo/anima-blue`; prior direct HTTP check returned 308 + canonical Location. All isolated sessions closed and temp artifacts cleaned.
  - Commits: T1 `32be480f`, T2 `2aafb175`, T3 `91668a3a`; evidence docs `fb0829b5`, `1f75f054`, `06cffb2d`. T4 evidence commit pending. No push/PR.

## Progress and evidence

- Read-only diagnosis completed before implementation. The component key omitted `via_agrupacion`; the catalog query combines direct and collective rows with `UNION ALL` and currently drops participation categories. Direct exhibition + activity rows alone are combined by an `EXISTS`/edition group and are not sufficient to explain duplicate keys.
- Before T2, the slug page called server-side `permanentRedirect` after async data resolution; the streamed response was HTTP 200 containing Next `NEXT_REDIRECT` + meta refresh. Next 16.2.12 supports a Node-runtime `src/proxy.ts`; the new proxy now returns an early HTTP 308 with Location, verified on a live alias.
- T1–T3 are implemented, independently verified and committed: `32be480f` (categorized panel), `2aafb175` (pre-stream 308), and `91668a3a` (flat profile timeline deduplication), with docs evidence commits `fb0829b5`, `1f75f054`, and `06cffb2d`.
- T4 passed: web suite 210 tests; type-check; lint (3 unrelated pre-existing warnings); forced build 2/2 tasks, zero cached, no DB fallback (2 existing metadataBase warnings); browser confirmed categorized panel, deduped profile, alias to canonical, and zero duplicate-key/browser console warnings. The final T4 evidence doc commit is pending.
