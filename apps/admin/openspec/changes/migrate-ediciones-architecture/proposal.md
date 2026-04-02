# Proposal: Migrate Ediciones Architecture

## Intent

The ediciones module is broken: 5 broken imports across 4 files, a store naming split-brain (`useEdicionDialog` vs `useEditionDialog`), 6 dead code files, and a 170+ line monolithic schema with 16 schemas + 14 types. This change migrates to the proven create/update dialog pattern (artistas reference) and cleans up all technical debt so the module compiles and follows project conventions.

## Scope

### In Scope

- Fix broken imports in surviving files (edition-row, edition-container)
- Delete 6 dead code files (superseded individual CRUD actions)
- Split monolithic schema into entity-specific files (edition, edition-day, place)
- Migrate to create/update dialog pattern with FormProvider + shared layout
- Standardize naming to English exports
- Remove duplicate manual types (derive from Zod)
- Action standardization
- Day dialog RHF migration

### Out of Scope

- Changes to `eventos/` route or its components
- DAL structure changes (`_lib/` already correct)
- `compose-editions.ts` changes (already correct)
- Poster upload implementation (display only, upload is future TODO)

## Approach

**Pre-computed Data + FormProvider + Shared Layout** (artistas pattern):

1. Page already computes `EditionWithDays[]` via `compose-editions.ts`
2. **EditionContainer** receives pre-computed data, passes to dialogs
3. **Store** (`useEditionDialog`) holds `EditionWithDays | null` for selected edition
4. **CreateEditionDialog** / **UpdateEditionDialog**: split dialogs, each wraps FormProvider around EntityFormDialog
5. **EditionFormLayout**: shared via `useFormContext`, handles `useFieldArray` for days
6. Keep `save-edition-with-days.action.ts` (transactional parent+children save is correct)
7. Day dialog also migrates to RHF with zodResolver (Phase 8)

Execution in 9 sequential phases (0-8), each independently committable.

## Affected Areas

| Area                             | Impact    | Description                                                   |
| -------------------------------- | --------- | ------------------------------------------------------------- |
| `eventos/ediciones/_actions/`    | Modified  | Delete 6 dead files, keep save/delete/create-place            |
| `eventos/ediciones/_components/` | Modified  | New create/update dialogs + shared layout, delete old dialogs |
| `eventos/ediciones/_schemas/`    | Modified  | Split 1 file into 4 entity-specific schemas                   |
| `eventos/ediciones/_store/`      | Verified  | Already correct, verify naming connection                     |
| `eventos/ediciones/_types/`      | Modified  | Remove duplicates, derive from Zod schemas                    |
| `eventos/ediciones/_lib/`        | No change | DAL already correct                                           |

## Risks

| Risk                                                | Likelihood | Mitigation                                             |
| --------------------------------------------------- | ---------- | ------------------------------------------------------ |
| Edition form complexity (parent + children + media) | High       | FormProvider + useFieldArray, same proven pattern      |
| Schema split import cascade (16 schemas)            | Medium     | Grep all imports before/after, single commit per phase |
| Store naming mismatch during migration              | Low        | Fix naming in Phase 0 before any dialog work           |

## Rollback Plan

All changes scoped to `eventos/ediciones/` only. Each phase is a separate commit — revert any phase independently via `git revert`. Dead code deletion recoverable from git history.

## Dependencies

- Existing artistas create/update dialog pattern (reference implementation)
- `@frijolmagico/database/schema` table definitions for drizzle-zod derivation

## Success Criteria

- [ ] All imports resolve (zero broken paths)
- [ ] `bun run type-check` passes with no errors
- [ ] Create edition dialog opens, validates, and saves correctly
- [ ] Update edition dialog opens with pre-filled data, saves correctly
- [ ] Day dialog validates via RHF (no manual validation)
- [ ] All types derived from Zod schemas (no duplicate manual types)
- [ ] Zero dead code files remaining
- [ ] All exports use English naming
