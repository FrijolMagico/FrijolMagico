# Entity form dialog viewport and responsive behavior

## Objective
Keep entity form dialogs content-sized when their content is short, prevent them from exceeding the viewport, and make long content navigable without editing the shared shadcn-style Dialog primitive.

## Why
Activity participation create/edit dialogs can become taller than the viewport when descriptions or optional registration fields grow. The activity forms also keep their columns side-by-side on narrow screens. The user confirmed that narrow layouts must stack vertically and that the dialog header and actions remain fixed while only the body scrolls, with visible separators between these regions.

## Scope and constraints
- Work in `/home/strocs/dev/FrijolMagico-entity-form-dialog-overflow` on `feat/entity-form-dialog-overflow`, based on `dev` at `e9ee9ba1c85f4100a36dae0f144d1f9bcaafbaaa`.
- Do not edit `apps/admin/src/shared/components/ui/dialog.tsx` or other shadcn-owned UI primitives.
- Implement shared dialog body scrolling, viewport boundaries, and header/footer separation in `EntityFormDialog`.
- Preserve the current width behavior of non-activity EntityFormDialog consumers; opt activity forms into content-sized panel width, with their form children owning activity-specific maximum widths, and stack their columns on narrow screens.
- Preserve current form behavior, actions, and desktop activity layout.
- Keep implementation narrow; inspect other EntityFormDialog consumers before changing any shared default that might affect them.
- No commit, push, or PR unless the user explicitly requests it.

## TDD and route
- TDD: strict RED → GREEN → REFACTOR, enabled by `openspec/config.yaml` / `openspec/project-context.md`.
- Exact focused runner: `bun run test --filter=@frijolmagico/admin` (root Turbo command; do not invoke `bun test`).
- Route: delegated direct implementation, mandatory multi-file writer trigger (shared wrapper plus both activity forms); the prior read-only exploration was delegated.
- Verification route: follow native `gentle_review` assess after writer completion because Receipt-driven development is off; obey its risk-gated plan and use `gentle-ai-verify` if required. Parent performs one bounded spot check.

## Tasks
- [x] **T1 — Bound and scroll entity form dialog content.** Keep the panel naturally sized for short content, impose viewport safety limits, make only the body scroll, keep header/actions visible with borders/separators, relocate activity width constraints to activity forms, and stack activity columns at narrow breakpoints. Add focused contract/render coverage where project patterns support it.

## Acceptance criteria
- The shared shadcn Dialog primitive is untouched.
- Existing non-activity EntityFormDialog consumers retain their previous width behavior and overall short-dialog appearance.
- On constrained viewport heights, the dialog stays within viewport margins; header and footer remain visible while the body scrolls, with bottom/top section separators.
- Activity create/edit columns stack vertically on narrow devices and retain intended multi-column desktop layout.
- Activity-specific width limits belong to the form/content, not the shared generic dialog sizing.
- Focused tests and applicable Admin checks pass, or any failure/unavailable check is recorded accurately. Existing width behavior for non-activity consumers is preserved.

## Progress
- Workspace created as a new worktree from local `dev`; no source files changed yet.
- Existing activity form/dialog behavior was explored in the prior read-only phase.
- First writer added viewport/body-scroll behavior, responsive activity columns, and structural tests; independent verifier confirmed Admin tests (519), type-check, lint after frozen install.
- T1 reopened after review found global `w-fit sm:max-w-none` regressed unrelated consumers; corrected with opt-in `contentSized` prop (activity dialogs opt in, others keep primitive default).
- Second writer demonstrated RED (contract test fails), implemented opt-in, GREEN (520 tests pass), REFACTOR (no behavior change).
- All three Admin checks pass: test (520), type-check, lint.
- User confirmed opt-in approach is correct and will perform visual verification.

## Verification evidence
- First bounded writer's Admin test/type-check/lint commands could not start because the new worktree lacked `node_modules` (`turbo: command not found`).
- Independent verifier ran `bun install --frozen-lockfile` successfully (942 packages), then `bun run test --filter=@frijolmagico/admin` passed (519 tests), `bun run type-check --filter=@frijolmagico/admin` passed, and `bun run lint --filter=@frijolmagico/admin` passed. Existing test warnings appeared.
- Corrective writer: `bun run test --filter=@frijolmagico/admin` RED→GREEN (520 tests), `bun run type-check --filter=@frijolmagico/admin` passed, `bun run lint --filter=@frijolmagico/admin` passed.
- Geometry and short-viewport rendering remain unverified; user will perform visual verification. Contract tests are structural only.

## Next step
T1 complete. Awaiting user visual verification; no further code changes unless verification reveals issues.
