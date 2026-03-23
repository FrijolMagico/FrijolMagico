# Ediciones Migration Specification

## Purpose

This specification defines the required behavior for migrating `eventos/ediciones` from its broken monolithic architecture to the standard create/update dialog architecture already used by stable entities. The migrated module MUST compile, use split Zod-derived schemas, and expose consistent English-facing action exports while preserving Spanish UI text.

## Requirements

### Requirement: Phase 0 — Surviving files MUST compile

The system MUST restore compile-safe imports and dialog-store wiring in the remaining survivor components before any deeper migration work proceeds.

**Acceptance Criteria**
- [ ] `edition-row.tsx` compiles without import errors
- [ ] `edition-container.tsx` compiles without import errors
- [ ] `page.tsx` renders without errors

#### Scenario: Survivor imports are corrected
- **GIVEN** the ediciones page imports surviving row and container components
- **WHEN** the migration updates schema and action imports to the current module paths and store API
- **THEN** `edition-row.tsx` and `edition-container.tsx` SHALL resolve all imports
- **AND** `page.tsx` SHALL render without runtime or compile errors

### Requirement: Phase 1 — Dead code MUST be removed

The system MUST remove superseded CRUD action files, the obsolete create dialog, and the unused hooks directory so the module no longer depends on abandoned flows.

**Acceptance Criteria**
- [ ] Deleted files removed from filesystem
- [ ] No remaining imports to deleted files
- [ ] Grep confirms no references

#### Scenario: Obsolete files are deleted cleanly
- **GIVEN** dead files still exist in `_actions`, `_components`, and `_hooks`
- **WHEN** the migration removes them and updates references
- **THEN** no source file SHALL import any deleted path
- **AND** repository search SHALL show zero surviving references

### Requirement: Phase 2 — Schemas MUST be split by entity

The system MUST replace the monolithic `edicion.schema.ts` with focused schema modules for edition, edition-day, place, and composite form state. All runtime and type imports SHALL derive from those schemas. Zod 4 and drizzle-zod patterns MUST be used for schema derivation and form-specific extensions.

**Acceptance Criteria**
- [ ] All schemas split correctly with proper imports
- [ ] All 16 files updated to new import paths
- [ ] No remaining imports to monolithic schema
- [ ] All types derivable from schemas
- [ ] Monolithic file deleted

#### Scenario: Schema consumers move to split files
- **GIVEN** current consumers import database and form types from `edicion.schema.ts`
- **WHEN** split schema files are introduced and imports are rewritten
- **THEN** each consumer SHALL import only the schema or type it needs
- **AND** the monolithic schema file SHALL no longer exist

#### Scenario: Form schemas follow Zod 4 patterns
- **GIVEN** edition and day forms require client validation
- **WHEN** form schemas are declared
- **THEN** the schemas SHALL be composed from insert or update schemas using Zod 4-compatible `.pick()`, `.omit()`, or `.extend()` patterns
- **AND** exported input types SHALL be derived from the schema definitions

### Requirement: Phase 3 — Dialog store MUST use composed edition data

The system MUST standardize the dialog store around `EditionWithDays` selection so update dialogs receive pre-computed edition data directly rather than recomputing it in the client.

**Acceptance Criteria**
- [ ] Store uses `EditionWithDays` type
- [ ] All components import from `../_store/edition-dialog-store`
- [ ] Store API matches what components need

#### Scenario: Update dialog reads selected edition from store
- **GIVEN** a user chooses Edit on an edition row
- **WHEN** the row opens the update dialog
- **THEN** the store SHALL hold the selected `EditionWithDays`
- **AND** the update dialog SHALL consume that selected object directly

### Requirement: Phase 4 — Dialogs MUST follow the shared FormProvider pattern

The system MUST provide `CreateEditionDialog`, `UpdateEditionDialog`, and `EditionFormLayout` using `FormProvider`, `useFormContext`, and `useFieldArray` so create and update flows share one layout but differ in initialization behavior.

**Acceptance Criteria**
- [ ] CreateEditionDialog opens with empty form
- [ ] UpdateEditionDialog opens with pre-filled data from selectedEdition
- [ ] FormProvider pattern matches artistas
- [ ] Shared EditionFormLayout used by both
- [ ] useFieldArray manages days correctly
- [ ] EntityFormDialog wrapper with proper submit
- [ ] Old dialog files deleted

#### Scenario: Create edition starts empty
- **GIVEN** the user clicks `Agregar Edición`
- **WHEN** the create dialog opens
- **THEN** the form SHALL start with empty root values and an empty `days` array
- **AND** the dialog SHALL close and reset after a successful save

#### Scenario: Update edition starts from composed data
- **GIVEN** the user opens Edit for an existing edition
- **WHEN** the update dialog opens
- **THEN** the form SHALL use `selectedEdition ?? emptyForm` as its values source
- **AND** poster preview data and nested days SHALL already be available without additional client composition

### Requirement: Phase 5 — Action exports MUST use English names

The system MUST standardize action export names to English for code-facing APIs while preserving Spanish UI labels.

**Acceptance Criteria**
- [ ] All exports use English naming
- [ ] All imports updated
- [ ] No remaining Spanish export names except UI text

#### Scenario: Source imports use standardized action names
- **GIVEN** edition and place actions are imported by components and forms
- **WHEN** the migration renames code-facing exports
- **THEN** all source imports SHALL resolve to English export names
- **AND** Spanish naming SHALL remain only in user-visible text

### Requirement: Phase 6 — Manual form types MUST be removed

The system MUST eliminate duplicate manual form-state and error types when equivalent schema-derived or library-native types exist.

**Acceptance Criteria**
- [ ] All manual types removed
- [ ] All types derived from Zod schemas
- [ ] No type duplication

#### Scenario: Duplicate types are replaced by schema-derived inputs
- **GIVEN** `_types/edition.ts` duplicates schema and RHF concerns
- **WHEN** schema-derived inputs replace those manual types
- **THEN** `DayFormState`, `EdicionFormState`, `Modality`, and `DayFieldErrors` SHALL no longer be required
- **AND** `paginated-edition.ts` MAY remain as the legitimate extension type

### Requirement: Phase 7 — Actions MUST accept typed payloads

The system MUST use typed inputs for server actions in this module and SHALL NOT require raw `FormData` for edition-specific create or place flows.

**Acceptance Criteria**
- [ ] All actions accept typed data
- [ ] No raw FormData usage

#### Scenario: Place creation validates typed input
- **GIVEN** a client submits a new place from the edition workflow
- **WHEN** the server action receives the payload
- **THEN** the action SHALL validate a typed object against the place insert schema
- **AND** the action SHALL not depend on `FormData`

### Requirement: Phase 8 — Day dialog MUST migrate to RHF and zodResolver

The system MUST replace manual day-dialog state and `validateDay()` logic with React Hook Form and `zodResolver(dayFormStateSchema)`.

**Acceptance Criteria**
- [ ] Manual `validateDay()` function deleted
- [ ] `DayFieldErrors` type removed
- [ ] Day dialog validates via RHF schema
- [ ] All fields work correctly

#### Scenario: Day dialog validates through schema
- **GIVEN** the user opens the day dialog for create or edit
- **WHEN** required fields are missing or invalid
- **THEN** validation errors SHALL come from the RHF resolver backed by `dayFormStateSchema`
- **AND** the dialog SHALL only call `onSave` with schema-valid `DayFormStateInput`
