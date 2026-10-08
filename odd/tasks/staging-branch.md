# Staging branch

## Objective
Rename `refactor/database-staging-web-cache` to `staging` in local and remote, and allow that branch through both Vercel projects' Ignored Build Step. The branch becomes an optional pre-`dev` environment for exercising deployed behavior, not a mandatory step in the release flow.

## Scope and authorization
User authorized the branch rename (local and remote) and adding `staging` to the Ignored Build Step exceptions. No source code change, no Production deployment, no database write, no migration, no env var mutation, no secret disclosure. Manual redeploy authorization is separate and unaffected. No commit requested.

## Rationale
The feature branch reached the tip of a merged PR (#237) and accumulated the work that is still unverified on a deployed environment. A stable branch name gives a predictable pre-`dev` deploy target without depending on a manual CLI upload per verification cycle.

## Preflight findings
- No local or remote `staging` branch existed before this scope.
- PR #237 for the old head is MERGED, so deleting the old remote branch closed nothing.
- HEAD was `4cfc9cb4`, equal to `origin/refactor/database-staging-web-cache`, working tree clean.
- `odd/tasks/stable-preview-config.md` documents an existing separate staging convention: manually assigned stable aliases `https://frijolmagico-staging.vercel.app` (Web, `dpl_H5S33msfATVsjzH1qL7kGoumMvmr`) and `https://admin-frijolmagico-staging.vercel.app` (Admin, `dpl_EcaMhMcCXuNn6g15BuNGeX462MkL`), both READY from 2026-10-02. Preview `WEB_REVALIDATION_URL` and Admin auth URLs resolve to those aliases.
- Consequence: a push to branch `staging` creates a git alias `frijolmagico-git-staging-<hash>`, but the stable aliases keep pointing at the 2026-10-02 deployments. Two different targets will carry the name "staging" and the Preview env vars will keep addressing the stable alias. Open decision, not resolved by this scope.

## Tasks
- [x] T1: Rename the local branch to `staging`. `git branch --show-current` reports `staging`.
- [x] T2: Add `staging` to `commandForIgnoringBuildStep` on both projects, verified by independent readback.
  - `frijolmagico`: `case "$VERCEL_GIT_COMMIT_REF" in main|dev|maintenance/web|staging) exit 1;; *) exit 0;; esac`
  - `admin-frijolmagico`: `case "$VERCEL_GIT_COMMIT_REF" in main|dev|staging) exit 1;; *) exit 0;; esac`
- [x] T3: Push `staging` and delete the old remote branch. `refs/heads/staging` at `4cfc9cb4`; `refs/heads/refactor/database-staging-web-cache` deleted.
- [ ] T4: BLOCKED. Neither project created any deployment for the new `staging` branch. Polled both projects at roughly 1, 3 and 4 minutes after the push: `sin-registro` every time. The newest deployment on both projects remains the 2026-10-04T16:49Z redeploy of the old branch.
- [ ] T5: Decide how a `staging` push becomes the environment that the stable aliases address.

## Ordering constraint
T2 preceded T3. A push while `staging` is outside the allow-list creates a deployment canceled about one second later, the failure this feature exists to remove. Ordering was correct; it is not the cause of T4.

## T4 analysis
- The Git integration was alive immediately before this scope: plain pushes to `refactor/database-staging-web-cache` created Git deployments at 2026-10-04T15:10:08Z and 15:53:34Z on both projects, with `githubDeployment: "1"` meta.
- PR #237 merged at 2026-10-02T15:42:29Z, two days before those pushes, and no PR was open for the branch. A "preview deployments only for PRs" configuration therefore does not explain them, and cannot explain the absence of a deployment for `staging`.
- Remaining candidates: the push that creates the branch does not by itself trigger a deployment, and the first real commit on the new branch will; or the repository webhook/integration stopped delivering push events after the old branch was deleted.
- These two are distinguished by one commit push on `staging`. No commit is authorized, so the experiment is pending user authorization.

## Acceptance and checks
- `git branch --show-current` reports `staging`; `git ls-remote --heads origin` reports `refs/heads/staging` at `4cfc9cb4` and no `refs/heads/refactor/database-staging-web-cache`. MET.
- Readback of `commandForIgnoringBuildStep` on both projects matches the intended commands. MET, exact strings confirmed by independent GET after PATCH.
- Local simulation of the `case` under `staging` returns exit 1 (build) and under empty ref returns exit 0 (skip). MET.
- Web and Admin each have a non-canceled deployment for branch `staging` at `4cfc9cb4`. NOT MET, blocked at T4.
- Configuration and git metadata readback only. Runtime behavior, cache invalidation, tag propagation and database routing are not proven by this scope and remain owned by `stable-preview-config.md` T8/T9 and `web-cache-resilience.md`.

## Evidence
- Preflight: `git branch --list staging` empty; `git ls-remote --heads origin | grep -Ei "staging|web-cache"` returned only `refs/heads/refactor/database-staging-web-cache`; `gh pr list --head refactor/database-staging-web-cache --state all` returned #237 MERGED.
- Rename: `git branch -m staging` succeeded, HEAD unchanged at `4cfc9cb4`.
- Config write: PATCH `/v9/projects/frijolmagico` and PATCH `/v9/projects/admin-frijolmagico` returned the intended `commandForIgnoringBuildStep`. Independent GET of both projects reproduced the same strings.
- Push: `git push -u origin staging` created the branch and set upstream; `git push origin --delete refactor/database-staging-web-cache` deleted the old branch; `git ls-remote` confirms only `refs/heads/staging` at `4cfc9cb4`.
- T4: three polls of `/v6/deployments` filtered by `meta-githubCommitRef=staging` returned no deployment for either project; unfiltered latest-four listing shows both projects unchanged since 16:49Z.
- Prior mechanism evidence: `vercel redeploy` of a Git deployment re-clones the commit and re-runs the Ignored Build Step, so it stays blocked. A CLI file upload does not execute the Ignored Build Step at all, which is why earlier manual previews were READY despite the allow-list.

## Open decisions
1. Branch `staging` produces a git-scoped alias. The stable aliases and Preview env vars still address the 2026-10-02 deployments. If `staging` is meant to be the reachable staging environment, each push must reassign the stable aliases, or the stable alias must be retired in favor of the branch-derived URL.
2. Whether the missing deployment is a branch-creation-only gap or a broken push webhook. Resolving it requires a commit push on `staging`, which is not authorized.

## Commit status
No commit requested. The only repository change in this scope is this untracked task document.