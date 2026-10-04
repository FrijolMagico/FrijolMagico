# Active display raw read

## Scope
Replace the web active festival display ORM read with raw SQL. Preserve cached display contract, selection semantics, date/venue ordering, null/error behavior, and single-snapshot consistency. Keep admin transaction readers intact. Preserve all unrelated catalog changes.

## State and delivery
Branch: refactor/database-staging-web-cache. Starting HEAD: 96571031bed2b3b69ba90d612b8e58ab81eb4d74. No commit, push or PR authorized. Forecast: 150–350 authored lines; ask-on-risk if materially larger.

## Design
Prefer one SELECT with selected-edition CTE and joined day/place rows, avoiding JSON aggregation and read/write transaction acquisition. Map ordered rows to the existing ActiveFestivalDisplay contract. Validate exact selection and equal-date ordering against the current ORM reader before changing behavior. Do not claim the original intermittent SQLITE_BUSY cause proven.

## Tasks
- [x] R1 (done, delegated worker): Implement raw SQL display read and preserve cache/error contract; focused tests and fresh types/lint independently verified. Multi-file writer trigger. Initial RED was environment/import failure, not behavioral assertion. Commit not authorized.
- [ ] R2 (in progress, delegated verifier): Independent parity and full web suite/types/lint passed. Fresh build failed at getFestivalSlugs with SQLite lock; test-isolation correction in progress. Concurrency/interleaving test not implemented; one-statement snapshot guarantee is structural evidence only. No remote DB access/writes. Commit not authorized.

## Acceptance
- Web runtime reader no longer imports ORM or runtime shared ORM reader.
- One SQL statement provides edition and all days/places from one snapshot.
- Same eligibility, selection tie behavior, projection and stable date ordering as before.
- No admin action changes; dedicated tag/cache life unchanged; errors not silently converted to null.
- Tests exercise SQL against isolated fixture only, not project snapshots; no remote writes.

## Evidence
- Fixture correction complete: owned file::memory: client, local fixture DDL and exported SQL, owned ORM parity, afterAll closes client. Final focused 4 tests/16 expectations and fresh types/lint pass. Independent spotcheck confirms isolation; no project/remote database touched. No meaningful concurrency test added.
- Native review review-ad64495247ebcc2f approved and acknowledged; authority burned for target sha256:8b0be2f17cceca66f2a697d6ad13128625159aea7a7a146397bf7298bc191824, tree fd106fde992fcfe4923ebc66cebb0bd12ced7f54, 4 files/325 authored lines. R3-001 at query.ts:33 is informational WARNING, full detail not available; no correction offered. Initial acknowledgement input rejected without mutation; resubmission via exact lineage succeeded.
- R2 remains incomplete because fresh build failed. Do not claim global lock resolution, regeneration, experimental concurrency or successful build. No commits authorized or created.
- Fresh build failed after compilation/types passed: page-data collection SQLITE_BUSY/SQLITE_BUSY_RECOVERY at getFestivalSlugs.ts:14, not AFI reader. No competing process identified, no retry, no Suspense error observed; prerender/sitemap not reached. Log /tmp/afi-r2-web-build.log; four AFI hashes unchanged.
- Fixture test used environment-backed singleton DDL; previous test commands explicitly used in-memory URL, but test itself lacked isolation. Worker correction to owned in-memory client launched; do not run unsafe fixture against project/remote DB. R2 remains partial.
- Writer implemented four AFI files: raw single-statement CTE/join reader, cached wrapper, wrapper tests and isolated SQL/ORM parity fixture. 179 additions/65 deletions reported.
- Writer focused checks: 4 tests/13 assertions passed, fresh web types passed after fixing test type error, scoped ESLint and diff check passed. Initial RED failed importing ORM without database URL, not a behavioral assertion; no behavioral RED claimed.
- ASSESS returned unassessable (intended untracked declaration required), native outcome unknown; independent verifier launched for full web tests, fresh types, lint and semantic parity. R1 remains in progress pending that verification. No build yet.
- Independent verifier: 291 web tests / 1036 assertions, fresh web types, four-file ESLint and diff checks passed. No functional blocker observed; SQL/ORM fixture parity covers eligibility, null venues and ordering. No meaningful concurrent-writer test: do not claim concurrency execution evidence.
- Fresh build delegated to mut5lwrf-4-kfxi after peer coordination; no source writes in flight.
- HEAD advanced to 4c7110a9 through peer-authorized catalog commits; none are AFI changes.
Peer catalog owner confirms no owned writer/build/server active and will avoid mutation during correction. Catalog review is a separate candidate and cannot approve this correction. Existing tests miss real transaction mode. Installed Drizzle ignores config and invokes libSQL transaction default write; direct raw single SELECT avoids that acquisition.
