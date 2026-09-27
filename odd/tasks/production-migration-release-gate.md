# Production migration gate for release PRs

## Objective
Prevent a `dev → main` release PR from merging unless pending production Turso migrations have completed successfully, while preserving the existing deployment flow.

## Decisions
- Run the existing Drizzle migration command for the release PR only; Drizzle skips migrations recorded in its journal.
- Apply migrations before merge. Therefore production migrations must remain compatible with the currently deployed application until release deployment completes.
- Do not deploy from this workflow or change Vercel deployment configuration.
- Protect production Turso credentials with a GitHub Environment and limit the migration job to the same-repository `dev → main` PR.
- Keep CI's disposable SQLite migration checks unchanged.

## Acceptance criteria
- Only a same-repository PR with head `dev` and base `main` can run the production migration job; all other PRs to `main`, including a fork branch named `dev`, fail the existing main-PR policy check.
- The migration job invokes the existing database migration script using production Turso credentials supplied by a protected GitHub Environment; credentials are never printed.
- The existing required PR quality check cannot pass if the production migration job fails or is cancelled, and ordinary PRs continue to run quality checks without production credentials.
- PR updates cannot run production migrations concurrently.
- Existing checks against the temporary SQLite database remain unchanged.
- Workflow syntax and gating behavior are verified without executing a production migration.

## Work tasks
1. Add a release-only, environment-protected Turso migration job ahead of PR quality checks; wire the existing quality check to fail closed on migration failure/cancellation while allowing skipped migration on non-release PRs. Reject forks targeting `main`, including a fork branch named `dev`.
2. Validate workflow syntax, conditional behavior, diff, and existing local CI configuration. Do not mutate external settings or run production migrations.
3. Configure/confirm the GitHub Environment secrets and the required `quality` status check. Reviewer approval is optional and was intentionally omitted by the user.
4. Open a PR to `dev` and validate the workflow through GitHub Actions before the release gate is relied on. Approved tracking issue: #193 (`status:approved`).

## External gate inventory (checked 2026-09-27)
- The active `Protect dev and main` ruleset requires `Lint & Type-Check & Build & Test`.
- The user created the `production-migrations` GitHub Environment and added environment secrets named `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; presence was confirmed via GitHub API without reading values.
- No required reviewer is configured, intentionally, because the user is the sole developer. Required-reviewer approval is optional; the environment-scoped secrets and workflow conditions remain in place.
- Existing relevant `Production` environments have no Turso credentials. Repository Actions secrets contain only `RELEASE_APP_PRIVATE_KEY`; repository variables contain only `RELEASE_APP_CLIENT_ID`. Repository owner is a personal account, so organization-level secrets do not apply.

## Non-goals
- Triggering Vercel deployments from GitHub Actions.
- Running production migrations for feature PRs, forks, or ordinary `dev` PRs.
- Changing migration files, database schema, or Drizzle migration semantics.
- Applying production migrations during implementation or verification.

## Progress
- Task 1: complete; same-repository release-only migration gate and fork-to-main rejection implemented; static conditions reviewed.
- Task 2: partial; `git diff --check` passed and routing semantics were reviewed. No YAML parser or `actionlint` is installed, so syntax validation remains outstanding.
- Task 3: complete; environment and secret names confirmed, quality required-check rule confirmed; no reviewers by the user's choice.
- Task 4: in progress; issue #193 is created and approved. Prepare the Conventional Commit and open the authorized PR to `dev`.
