# Admin release changelog

## Objective

Show administrators the published GitHub release history in admin, with a small sidebar link beside the current version. The latest release starts expanded; every older release starts collapsed. Remove the root Bun version pin because the project uses the latest Bun release.

## Context and constraints

- Worktree: `/home/strocs/dev/FrijolMagico-admin-changelog`, branch `feat/admin-changelog`, based on `origin/dev` at `f8a3afcd`.
- GitHub Releases for `FrijolMagico/FrijolMagico` are the source of truth; CI already publishes release notes.
- Releases are non-critical UI data. If the GitHub request fails or returns unusable data, render no release entries and no error message.
- The page belongs to the authenticated admin route group. Preserve server-side authorization.
- Fetch all published releases, not only the first API page. Render release Markdown without allowing embedded raw HTML.
- Do not modify CI, add database state, or touch the original dirty worktree.
- The original implementation was left uncommitted. The user now authorizes the sidebar refinement and creating a PR afterward, without creating an issue.
- TDD: strict TDD is required by the active Gentle AI skill for code with existing tests. Exact test runner: `bun run test --filter=@frijolmagico/admin` (Turbo workspace command; do not run `bun test`).
- Turbo requires `devEngines.packageManager.name` and `.version`, and rejects ranges across multiple major versions. The user authorized `devEngines.packageManager.version: "^1.0.0"` (any Bun 1.x, without a patch/minor pin); root `packageManager` remains absent.
- Estimated authored diff: approximately 250–400 lines. Delivery strategy: `ask-on-risk`.

## Tasks

- [x] **T1 — Remove the Bun version pin**
  - Remove the root `packageManager` field that pins `bun@1.2.2`; leave dependency manifests and CI setup unchanged.
  - Check: inspect root `package.json`; `bun install --frozen-lockfile` remains valid.
  - Route: inline mechanical edit (one known file).

- [x] **T2 — Implement the changelog experience**
  - Add a server-side, typed release-data function following the admin DAL/cache convention.
  - Retrieve all published releases from the public GitHub API, normalize/sort newest first, and fail closed to no entries on fetch/response errors.
  - Add authenticated `/changelog` page using the existing release accordion primitive; newest expanded by default and all older releases collapsed.
  - Render release notes safely as Markdown; show no error/empty-data notice when no releases are available.
  - Add a small link beside the sidebar version and cover data, page/accordion, and sidebar behavior with focused tests.
  - Ensure `/changelog` is included in the explicit route protection matcher if required by the existing auth proxy.
  - Route: delegated direct writer; one bounded multi-file feature.

- [x] **T3 — Verify and reconcile**
  - Run the authorized workspace checks and inspect the final diff/worktree.
  - Required commands: `bun run test --filter=@frijolmagico/admin`, `bun run type-check --filter=@frijolmagico/admin`, `bun run lint --filter=@frijolmagico/admin`.
  - Record exact outcomes; do not claim completion if required checks fail.
  - Route: delegated verification when required by native risk assessment; parent performs the mandatory spot-check.

- [x] **T4 — Polish the sidebar changelog link**
  - Remove the link underline and insert a visible hyphen separator between the version and the link.
  - Add/update the focused sidebar test and confirm its behavior.
  - Route: delegated direct writer; component and test are a bounded two-file change.

- [ ] **T5 — Commit and open the PR (in progress)**
  - Refresh remote `dev` and determine whether the feature branch needs to be updated before PR creation; preserve all feature changes.
  - Create one Conventional Commit for the complete feature and polish.
  - Open a PR to `dev` without creating or linking an issue, as requested; apply the appropriate type and release-version labels.
  - Report the PR URL and any checks still pending.
  - Route: parent orchestration under the branch-PR workflow.

## Acceptance criteria

- Root `package.json` no longer pins a Bun version.
- Sidebar displays a small changelog link adjacent to the current version.
- `/changelog` is protected by admin authentication and lists all published releases newest first.
- Only the newest release is initially expanded; older releases are initially collapsed and can be opened.
- Release notes retain readable Markdown formatting without rendering raw HTML.
- GitHub/API failures produce no release entries and no user-facing error state.
- No CI, database, or unrelated-worktree changes.

## Progress and evidence

- Initial base: `origin/dev` commit `f8a3afcdfff9990f2b62da4e16faee3dd91cdba6`.
- Dependencies installed with `bun install --frozen-lockfile` before feature work; Bun runtime is `1.4.2`.
- T1 completed: removed the root `packageManager` pin; `bun install --frozen-lockfile` passed and made no lockfile changes.
- T2 completed by the writer: `devEngines.packageManager` now declares Bun with `^1.0.0`; root `packageManager` remains absent. The exact test runner finally executed; RED was observed for the missing sidebar link, then GREEN was reported after implementation. Tests cover release pagination, sorting, network/HTTP/invalid responses, accordion/Markdown safety, empty data, and sidebar navigation.
- Writer-reported checks: admin tests 598 passed, type-check passed, lint passed, frozen install passed, `git diff --check` passed. One initial test run was interrupted due to a test mock matching page 1/page 10; the mock was corrected before the successful run. A type error in a fetch mock was also corrected.
- The worker runtime reported process cleanup unconfirmed. The separate verifier independently passed the scoped admin tests (598 tests, 0 failures), type-check, lint, and `git diff --check`; it also reviewed route authentication, pagination/fail-closed behavior, accordion initial state, and raw-HTML-safe Markdown rendering.
- Parent spot-check: reran `bun run test --filter=@frijolmagico/admin`; exit 0, 598 passed, 0 failed across 99 files.
- Final `git status` readback contains only the expected feature files and this task document; no commit, push, or PR was created.
- Build, browser E2E, and live GitHub API checks were not run; they are outside the scoped verification plan.
- T4 completed: removed the link underline, added a hyphen separator, and updated the focused test. RED was observed before the component edit; GREEN: 598 admin tests passed; lint passed. Only the component and its test were changed for this refinement.
- T5 preflight: fetched `origin/dev`; feature branch is one commit behind due to an unrelated web image-cache fix. No rebase/merge or PR has been performed; the branch and dev have no conflicting changes in the observed work.
- Final checks after T4: admin tests 598/598 passed, admin lint passed, admin type-check passed, and `git diff --check` passed.
- PR policy: local template allows no issue when none exists; user requested no issue. Available labels include `type:feature` and `minor`. No existing PR was found for this head branch.
- Next step: stage only the expected feature/task files, commit conventionally, push the branch, and open the PR to `dev` without an issue as requested.
