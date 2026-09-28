# Seed expansion — richer festivals, artists and an active edition

## Objective and decisions

Extend `packages/database/seed/seed.sql` so local development gets more cases,
mirroring the shape of the production database (`db-frijolmagico` via Turso CLI):

- Add 5 new Festival Frijol Mágico editions (III–VII) with days.
- Add 60 new catalog artists (ids 21–80) with avatar, historial and catalog rows.
- Make one edition (VII, "Recolectando Semillas") as data-rich as the latest
  production edition (XVI): 79 participations, expositions, 34 activities and 2 days.
- Leave the last seed edition (VII) as the ACTIVE one: `published = 1` plus future
  dates (2026-10-09/10) so `getActiveFestival()` selects it.

Decisions:

- "festivales" = `evento_edicion` rows (the seed's festivals are editions).
- Reuse existing dev-CDN poster and avatar files (no new assets generated):
  posters `festivales/frijol-magico/{i|ii}/afiche-123456789.webp`, avatars rotating
  the 15 existing `artistas/<slug>/avatar-123456789.webp`.
- Keep the seed idempotent-friendly by continuing existing id ranges; new artists
  get ids 21–80 so the rich edition can hold 78 artists + 1 agrupación.

## Implementation scope and forecast

Substantial implementation, single file (`packages/database/seed/seed.sql`) plus the
ODD doc. Generated deterministically by a throwaway script to avoid hand-writing
~1100 lines. TDD mode is not the driver here (data fixture, no logic); verification is
seeding a disposable DB and inspecting counts/queries. Runner: `bun run seed`
(database workspace) and the app test suites for regressions.

## Work units

- [x] WU1 — Seed extension: 2 places, 60 artists (+ imagen/historial/catalogo),
      5 editions III–VII with days. Route: single-file generation.
- [x] WU2 — Rich edition VII mirroring production XVI (79 participaciones, 61
      exposiciones, 34 actividades, 40 occurrences) and set as ACTIVE edition.
      Route: same generation pass.
- [x] WU3 — Verification: run seed into a disposable DB, assert counts, run the
      `getActiveFestival()` query and applicable tests. Route: inline verification.

## Acceptance and safety

- `bun run seed` completes with no SQL error and `PRAGMA foreign_keys = ON`.
- `SELECT COUNT(*) FROM evento_edicion` = 7; artists = 80.
- Edition VII has 79 participations and future dates; `getActiveFestival()` returns VII.
- No new CDN assets referenced; no production DB mutation; no secrets.

## Progress

- Remote DB inspected read-only with Turso CLI: 2 events, 20 editions, 362 artists;
  edition XVI (id 20) is the richest (79 participaciones, 60 exposiciones, 33
  actividades, 2 días) with dates 2026-10-09/10.
- Seed generator produced ~1112 SQL lines; counts validated: 5 editions, 10 days,
  60 artists, 60 avatars, 60 historial, 60 catalog, 103 participaciones, 81
  exposiciones, 40 actividades, 40 occurrences, 1 registration.
- Splice into `seed.sql` completed (1758 lines total, +1113 insertions).
- `bun run seed` on a disposable `local.dev.db`: OK (628 KB), no SQL error.
- Counts after seed: 1 event, 7 editions, 80 artists, 4 places, 124 participaciones,
  96 exposiciones, 48 actividades, 14 días, 46 occurrences.
- Edition VII (id 7): 79 participaciones, 60 exposiciones, 33 actividades, 2 días →
  exact parity with production edition XVI.
- `getActiveFestival()` query returns id 7 (`frijol-magico-vii`), published 1,
  2026-10-09/10 → VII is the active edition.
- Database suite: 60 pass / 0 fail (includes `parseSeedAssetKeys` over the real
  `seed.sql`). Prettier applied to the ODD doc.
- Not committed: awaiting explicit user request (no direct `dev` commits; branch
  per scope before committing).
