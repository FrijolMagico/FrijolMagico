## Summary

- Makes shared multipart parsing domain-neutral while preserving opaque feature fields for dispatch.
- Adds generic provisional receipt subjects with independent persistence and discard deadlines, retaining legacy receipt compatibility.
- Removes obsolete shared object-key and target-validation policies while preserving artist-avatar concurrency and activation metadata at the route boundary.

## PR Type

- [ ] Bug fix
- [ ] New feature
- [x] Refactor
- [ ] Chore / tooling

## Linked Issue

Closes #148

## Changes

| File | Change |
|------|--------|
| `apps/admin/src/shared/assets-manager/server/multipart.ts` | Returns neutral target, entity, blob, and opaque multipart fields without importing artist-avatar contracts. |
| `apps/admin/src/shared/assets-manager/server/provisional-asset-receipt.ts` | Supports generic subjects and independent persistence/discard deadlines with legacy overlap. |
| `apps/admin/src/app/(core)/api/assets/route.ts` | Parses before dispatch and preserves artist-avatar optimistic-concurrency and activation metadata in the route compatibility boundary. |
| `apps/admin/src/shared/assets-manager/server/object-key.ts` | Removed obsolete target-specific object-key policy. |
| `apps/admin/src/shared/assets-manager/server/validation.ts` | Removed obsolete target-specific validation policy. |
| `apps/admin/tests/unit/shared/assets-manager/server/multipart.test.ts` | Covers neutral multipart primitives and opaque compatibility fields. |
| `apps/admin/tests/unit/shared/assets-manager/server/provisional-asset-receipt.test.ts` | Covers generic subjects, deadline purposes, and legacy receipt verification. |
| `apps/admin/tests/unit/app/(core)/api/assets/route.test.ts` | Covers parser-before-dispatch, ignored legacy slug, and preserved avatar metadata. |
| Obsolete object-key and validation tests | Removed with their dead production modules. |

## Test Plan

- [x] Focused U2 suite — 24 passed, 0 failed, 60 assertions before the bounded review correction
- [x] Focused route and multipart regression suite — 17 passed, 0 failed after the bounded review correction
- [x] `bun run type-check --filter=@frijolmagico/admin` — passes
- [x] `bun run lint --filter=@frijolmagico/admin` — passes
- [x] Check-only Prettier — passes
- [x] `git diff --check` — passes

## Chain Context

| Field | Value |
|-------|-------|
| Chain | Decouple asset-manager domain policies |
| Tracker | `feature/decouple-asset-manager-domain-policies` |
| Position | U2 of U4 |
| Base | `feat/asset-manager-shared-client-policy` (PR #172) |
| Depends on | PR #172 — shared client policy injection |
| Follow-up | U3 — artist-avatar authority and lifecycle |
| Review budget | 749 changed lines / 800-line session budget |
| Starts at | U1 commit `57b4ce4` |
| Ends with | Neutral shared server boundaries and generic receipt infrastructure |

### Chain Overview

```text
dev
└── feature/decouple-asset-manager-domain-policies — tracker
    └── #172 feat/asset-manager-shared-client-policy — U1
        └── 📍 refactor/asset-manager-neutral-server-boundaries — U2
            └── U3 — artist-avatar authority and lifecycle
                └── U4 — compatibility and integration
```

### Scope

- Includes: neutral multipart parsing, generic receipt deadlines, route compatibility parsing, dead shared-policy removal, and focused tests.
- Excludes: authoritative artist/catalog resolution, canonical UUID paths, persistence/discard lifecycle changes, client rollout, schema changes, and durable upload coordination.

### Autonomy

- [x] CI is expected to pass for this PR branch.
- [x] This PR has one deliverable scope.
- [x] This PR can be rolled back without unrelated changes.
- [x] Focused tests cover this unit.

### Rollback

Revert this U2 work unit to restore the previous multipart, receipt, and route behavior together with the removed policy modules. U1 client preparation remains intact, and no database or R2 migration is involved.

## Notes

- Runtime harness: N/A. U2 exercises mocked multipart HTTP and receipt boundaries; no live database, R2, or network resource is required.
- Native reliability review found R3-001, and the bounded correction restored `expectedActive`, `catalogId`, and `requestedActive` forwarding without reintroducing domain policy into shared multipart.
- Post-correction native status failed safely before validation/finalization, so no terminal native review receipt exists. This PR does not claim native review PASS.
