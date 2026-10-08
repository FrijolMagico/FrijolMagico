# Stable Preview configuration

## Objective
Align Admin's generic Preview URL configuration with stable staging aliases while preserving dev and Production, and remove obsolete feature-branch overrides.

## Scope and authorization
User authorized Vercel CLI environment inspection and configuration changes for BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL, and WEB_REVALIDATION_URL. Create dev overrides if missing. User manages Google callback. No credential-file access, secret disclosure, or database mutation. Subsequent user authorization: correct malformed Production NEXT_PUBLIC_APP_URL (done, readback verified), and redeploy selected staging Admin with alias reassignment. No Production deployment or Web deployment authorized. No automatic alias promotion configured. No commit requested for this scope.

## Rationale
One stable shared staging slot supports fixed OAuth origins and Admin-to-Web invalidation. Branch-specific overrides must not defeat generic configuration. Preserve existing dev URLs before changing inherited defaults.

## Tasks
- [x] T1: Inspect exact public URL values/scopes and establish preservation baseline. CLI/API readback observed.
- [x] T2: Preserve dev with explicit overrides, then align generic Preview and remove the three obsolete refactor/database-staging-web-cache overrides. Mutation commands succeeded; validation is tracked separately in T3.
- [x] T3: Independently verify scopes/values and feature-branch inheritance. Preview/dev/development assertions passed; existing Production caveat recorded below. No Production URL value was mutated.

- [x] T4: Redeploy selected staging Admin with updated configuration. Independent verifier confirmed dpl_CRKZZxMkCeL7VuQ8H3yw2sTAA7yg READY Preview.
- [x] T5: After READY, reassign stable Admin alias and verify its exact mapping. CLI assignment succeeded and inspect confirmed exact deployment ID.
- [ ] T6: Verify runtime login and live cache test prerequisites; user-operated login/mutations only. In progress: user confirmed login/staging data. User additionally requested detailed timestamped HTTP status/cache headers/TTFB/total time across edit and restoration, and Turso staging usage counters before/after. Human edit paused until usage baseline exists.
  - [ ] T6a: Record HTTP and staging usage baseline with provider reporting window/limitations.
  - [ ] T6b: Observe first/subsequent same-URL requests after user name-only edit; correlate invalidation evidence if available.
  - [ ] T6c: Verify user restoration, repeat observations and compare provider counter deltas without assuming exclusive causality.

## Acceptance and checks
Generic Preview Admin URLs: https://admin-frijolmagico-staging.vercel.app.
Generic Preview revalidation: https://frijolmagico-staging.vercel.app/api/revalidate.
Dev retains its previously effective URL configuration; Production remains unchanged.
Verification is metadata/configuration readback, not functional login proof. Test-first is not applicable to remote configuration-only updates. Redeployment, Google callback, protection compatibility and live cache mutation test remain pending.

## Evidence
- Stable aliases independently map to selected READY Preview deployments; Admin protected (302 to Vercel), Web GET 200.
- CLI env list metadata: three feature-branch overrides; no dev entries for these keys.
- Generic WEB_REVALIDATION_URL currently has combined production/preview targets; preserve Production when splitting or modifying scope.
- Review inspect found zero registered lineages in current worktree; no lifecycle mutation performed.
- Targeted CLI API decrypted readback: inherited dev BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL are https://admin-frijolmagico.vercel.app; WEB_REVALIDATION_URL is https://www.frijolmagico.cl/api/revalidate.
- No dev overrides exist for these keys. Preserve these exact inherited values in explicit dev overrides.
- API OpenAPI confirms PATCH /v9/projects/{idOrName}/env/{id} supports target-only update; preserve combined entry's Production value while moving Preview to a new entry.
- Created dev overrides with verified inherited values. Updated generic auth URLs by exact env IDs after CLI generic update failed with multiple_envs.
- Existing Production revalidation entry retains its value and now targets Production only. Generic create command failed and readback showed no new entry; moved existing feature revalidation entry to generic Preview with the stable Web URL instead.
- Removed feature-branch auth overrides; all successful mutations returned exit 0.
- Independent verifier confirmed generic Preview URLs, explicit dev values, zero feature-branch entries, Production auth/revalidation and development localhost values.
- Production NEXT_PUBLIC_APP_URL entry 9mSsuboT50wNieeI reads https:admin.frijolmagico.cl (missing //). Parent baseline already contained this ID and did not return a readable https:// URL. This entry was not mutated; exact prior plaintext equality was not established. Correction is outside this scope and requires user authorization.
- Verifier's initial assertion had a target-array handling bug; corrected assertions passed. Configuration readback does not verify runtime auth.

## Live test findings and follow-ups
- Name edit was confirmed by user; Web continued serving original heading with HIT Age 478/479 then 820/821. Reported Turso counts rose from 82,658/9,200 to 83,990/9,215 before Web GETs, then remained unchanged.
- Runtime Admin logged Web cache sync failed at 18:40:51 UTC while returning HTTP 200. Returned Web logs did not include a revalidation POST in that interval.
- Future follow-up requested by user: a name-only edition edit should update only that edition row. Investigate related-day rewrites, triggers, auth and concurrent activity before attributing the aggregate +15 written rows. No fix authorized yet.
- Deployment API metadata: Admin declares c395224d2b70020758d284d2e1e540908f78e816; Web declares d2fb0c5049a1e5d6d937d846096b13ed8d709996; current repository HEAD b593a719b2949cecaaa5435b6d48b693f6a7c0a5.
- Git comparisons found no changes between declared revisions and HEAD in Admin save-edition-with-days.action.ts, web-invalidation.ts or Web api/revalidate/route.ts. CLI deployment commit metadata alone does not prove absence of uploaded uncommitted changes.

## Staging secret repair and retest
User confirmed the shared REVALIDATION_SECRET was assigned only to Production and updated its environment scopes manually. User now explicitly authorizes redeploying both selected staging Preview apps, maintaining their stable aliases, and establishing a new read-only HTTP/Turso baseline before the next human edition-name edit. No Production redeploy, secret rotation, manual invalidation POST, source change, or database write is authorized.
- [x] T7: Redeploy selected Admin and Web to Preview using the existing deployment artifacts with current environment configuration. Verifier observed READY Preview at 2026-10-02T19:15:00.704Z: Admin dpl_EcaMhMcCXuNn6g15BuNGeX462MkL; Web dpl_H5S33msfATVsjzH1qL7kGoumMvmr. Both runtime inventories include REVALIDATION_SECRET; build inventories do not. Stable alias assignment commands succeeded for both new deployments; independent mapping/baseline verification follows.
- [ ] T8: Verify READY Preview status, secret-name presence without values, stable alias mappings, and fresh HTTP/Turso baseline; then signal the human to edit. BLOCKED: 2026-10-02T19:16:54.307Z /festivales/temp returned 404 MISS Age 0, TTFB/total 2558.3/2571.3 ms; 19:16:56.906Z and 19:16:57.376Z returned 404 HIT Age 0, 411.2/443.6 and 360.5/377.0 ms. H1 404, marker absent. Turso before/after unchanged 86,577 reads / 9,233 writes, 704 kB storage / 778 kB sync. Usage lag/window unknown. Inspector confirmed deployments READY but did not establish stable-alias mapping. Read-only incident diagnosis in progress; human edit paused.
- [x] T8 baseline follow-up: Both stable alias deployment IDs verified. Source save recalculates slug from parent-event slug and edition number on every save; unchanged submitted days are also updated. User clarified seed did not leave temp, and reported canonical page shows edited name. At 2026-10-02T19:34:30/31/31Z, canonical /festivales/frijol-magico-vii returned 200 PRERENDER/HIT/HIT, Age 0 each; TTFB/total 462/577, 259/378, 210/284 ms. Marker [prueba caché] present each. HTML title remains Festival Frijol Mágico VII | Asociación Cultural Frijol Mágico; H1 was not reported by verifier. Turso 19:34:03 before and 19:34:34 after: unchanged 94,401 reads / 9,233 writes, 704 kB. Reporting lag/window unknown; no exclusive attribution. This establishes readiness for the next human edit, not successful invalidation.
- [ ] T9: Measure after the human edit and verify eventual restoration. Post-edit measurements observed: Admin POST /eventos/ediciones 200 at 19:36:26.548Z (two matching log records, not proof of two actions), with no cache-sync-failed warning in returned records. Web POST /api/revalidate 200 at 19:36:27.036Z and 19:36:28.039Z. First measured canonical GET returned 200 REVALIDATED Age 0, TTFB/total 3119.4/3287.1 ms; next two 200 HIT Age 0/1, 442.7/541.0 and 253.4/352.4 ms. H1 VII Festival Frijol Mágico; prior [prueba caché] marker absent throughout. Per-GET UTC start times were not supplied by verifier. Turso 19:38:25 pre-Web: 95,406 reads / 9,233 writes, +1,005/0 from baseline; 19:39:08 post-Web unchanged. Unknown reporting window/lag prevents exclusive attribution. Transport/authentication receipt and cache refresh observed; exact intended human name and restoration confirmation remain pending.
Configuration-only work has no meaningful unit-test RED; use deployment metadata and functional HTTP checks. No new commit requested.

## Next step
User reports Google callback configured. Production NEXT_PUBLIC_APP_URL correction to https://admin.frijolmagico.cl explicitly authorized and verified; no Production deployment.
Authorized staging Admin redeploy at https://admin-frijolmagico-iqw6zvz3i-frijol-magicos-projects.vercel.app is READY Preview (dpl_CRKZZxMkCeL7VuQ8H3yw2sTAA7yg). Stable alias https://admin-frijolmagico-staging.vercel.app reassigned and exact mapping verified. Branch/SHA metadata unavailable. User confirmed successful Google login and recognizable staging data. This supports intended database routing but is not independent deployed connection-identity proof. No live mutation/revalidation test claimed. Work-unit commit pending explicit user request; no approval or completed functional test claimed.
