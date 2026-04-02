# Design: Migrate Ediciones Architecture

## Technical Approach

Migrate ediciones from a broken monolithic dialog + split-brain store + 157-line schema to the artistas create/update pattern: split schemas → fix store → FormProvider + EntityFormDialog + shared EditionFormLayout. Keep `save-edition-with-days.action.ts` (transactional, correct). Migrate day dialog to RHF.

## Architecture Decisions

| Decision                    | Choice                                                                                                  | Alternative                                           | Rationale                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Schema split strategy       | 4 files: `edition.schema.ts`, `edition-day.schema.ts`, `place.schema.ts`, `edition-composite.schema.ts` | 2 files (entity + composite)                          | Matches artistas pattern: one schema per DB table, one composite for form                  |
| EditionWithDays composition | Compose at row-click time (in `EditionRow.openEdit`) from `edition + days[]` already in props           | Pre-compute in page.tsx via modified compose-editions | Avoids changing working DAL/compose pipeline; row already receives filtered days           |
| Store selectedEdition type  | `EditionWithDays \| null` (edition fields + `days: DayFormStateInput[]`)                                | Keep `Edition \| null`, pass days separately          | Artistas pattern: store holds complete entity for `values:` binding                        |
| Day dialog validation       | RHF with `zodResolver(dayFormStateSchema)`                                                              | Keep manual `validateDay()` + useState                | Consistency with parent form; eliminates 2 manual types (`DayFieldErrors`, `DayFormState`) |
| Update dialog data binding  | `useForm({ values: selectedEdition })` with RHF `values` prop                                           | `defaultValues` + manual reset                        | `values` prop auto-syncs when store changes — artistas proven pattern                      |
| Store naming                | Rename file to `edition-dialog-store.ts`, export `useEditionDialog` (English)                           | Keep Spanish `useEdicionDialog`                       | Matches project convention: English exports. Fix the split-brain.                          |
| Form submit wiring          | `<form id={FORM_ID}>` + `EntityFormDialog submit={{ form: FORM_ID }}`                                   | Manual button with `handleSubmit`                     | Artistas pattern; separates form from dialog chrome                                        |

## Data Flow

```
page.tsx (RSC)
│  getEditions() → editions[]
│  getEditionDays(ids) → days[]
│  getPlaces() → places[]
│  getEventosLookup() → events[]
│  composeEditions(editions, days, places, events) → PaginatedEdition[]
│
└─► EditionsContainer (client)
     ├── EditionTable → EditionRow[]
     │    └── onClick "Edit" →
     │         mapEditionToFormData(edition, rowDays) → EditionWithDays
     │         store.openUpdateEditionDialog(editionWithDays)
     ├── CreateEditionDialog
     │    ├── useForm({ defaultValues: emptyForm })
     │    ├── FormProvider wraps EntityFormDialog
     │    └── <EditionFormLayout eventos={} lugares={} />
     └── UpdateEditionDialog
          ├── store.selectedEdition → EditionWithDays
          ├── useForm({ values: toFormValues(selectedEdition) })
          ├── FormProvider wraps EntityFormDialog
          └── <EditionFormLayout mode="update" eventos={} lugares={} />

EditionFormLayout (shared via useFormContext)
├── Evento Select (Controller)
├── NumeroEdicion + Nombre (register)
├── PosterSection (update mode only, display-only)
└── Days section
     ├── useFieldArray({ name: 'days' })
     ├── EdicionDaysTable (fields display)
     └── EdicionDayDialog (RHF: zodResolver + useForm)
          ├── fecha, horaInicio, horaFin, modalidad
          └── LugarCombobox (unchanged)
```

## File Changes

| File                                        | Action        | Description                                                                                                                        |
| ------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `_schemas/edicion.schema.ts`                | **Rewrite**   | Keep only edition schemas: `editionSelectSchema`, `edicionInsertSchema`, `edicionUpdateSchema`, `edicionFormSchema` + Edition type |
| `_schemas/edition-day.schema.ts`            | **Create**    | `editionDaySelectSchema`, `edicionDiaInsertSchema`, `dayFormStateSchema` + EditionDay, DayFormStateInput types                     |
| `_schemas/place.schema.ts`                  | **Create**    | `placeSelectSchema`, `lugarInsertSchema`, `lugarFormSchema` + Place, LugarInput types                                              |
| `_schemas/edition-composite.schema.ts`      | **Create**    | `edicionRootFormSchema`, `edicionWithDaysSchema` + composite types. Imports from siblings                                          |
| `_store/edition-dialog-store.ts`            | **Modify**    | Change `selectedEdition` type to `EditionWithDays \| null`. Import from composite schema                                           |
| `_types/edition.ts`                         | **Modify**    | Remove `EdicionFormState`, `DayFieldErrors` (dead). Keep `Modality` type guard. Add `EditionWithDays` interface                    |
| `_types/index.ts`                           | **Modify**    | Update re-exports to match split schemas                                                                                           |
| `_types/paginated-edition.ts`               | **No change** | Already correct                                                                                                                    |
| `_components/edition-create-dialog.tsx`     | **Rewrite**   | Full CreateEditionDialog: useForm + FormProvider + EntityFormDialog + EditionFormLayout                                            |
| `_components/update-edition-dialog.tsx`     | **Create**    | UpdateEditionDialog: useForm({ values }) + FormProvider + EntityFormDialog + EditionFormLayout                                     |
| `_components/edition-form-layout.tsx`       | **Create**    | Shared layout extracted from current `edition-dialog-form.tsx`, uses `useFormContext`                                              |
| `_components/edition-dialog-form.tsx`       | **Delete**    | Superseded by form layout + split dialogs                                                                                          |
| `_components/edition-dialog.tsx`            | **Delete**    | Superseded by create/update dialogs                                                                                                |
| `_components/edition-container.tsx`         | **Modify**    | Fix store import, render CreateEditionDialog + UpdateEditionDialog, remove openDialog button, fix variable names                   |
| `_components/edition-row.tsx`               | **Modify**    | Fix store import, compose EditionWithDays on edit click                                                                            |
| `_components/edition-day-dialog.tsx`        | **Modify**    | Migrate from useState/validateDay to RHF with zodResolver                                                                          |
| `_components/place-combobox.tsx`            | **Modify**    | Fix import path: `addLugarAction` → `add-lugar.action` doesn't exist, should be `create-place.action`                              |
| `_constants/index.ts`                       | **Modify**    | Add `CREATE_EDITION_FORM_ID`, `UPDATE_EDITION_FORM_ID`                                                                             |
| `_actions/create-edition.action.ts`         | **Delete**    | Dead code, superseded by save-edition-with-days                                                                                    |
| `_actions/create-edition-day.action.ts`     | **Delete**    | Dead code                                                                                                                          |
| `_actions/update-edition.action.ts`         | **Delete**    | Dead code                                                                                                                          |
| `_actions/update-edition-day.action.ts`     | **Delete**    | Dead code                                                                                                                          |
| `_actions/delete-edition-day.action.ts`     | **Delete**    | Dead code                                                                                                                          |
| `_actions/save-edition-with-days.action.ts` | **No change** | Already correct (transactional)                                                                                                    |
| `_actions/delete-edition.action.ts`         | **Modify**    | Fix export name: `deleteEdicionAction` → `deleteEditionAction` (English convention)                                                |
| `_actions/create-place.action.ts`           | **Modify**    | Update schema import from `edicion.schema` → `place.schema`                                                                        |

## Interfaces / Contracts

### Schema Split (key types)

```typescript
// _schemas/edition.schema.ts
export type Edition = z.infer<typeof editionSelectSchema>
// { id, eventoId, numeroEdicion, nombre, posterUrl, slug }

// _schemas/edition-day.schema.ts
export type EditionDay = z.infer<typeof editionDaySelectSchema>
export type DayFormStateInput = z.infer<typeof dayFormStateSchema>
// DayFormStateInput: { tempId, fecha, horaInicio, horaFin, modalidad, lugarId, existingId? }

// _schemas/edition-composite.schema.ts
export type EdicionRootFormInput = z.infer<typeof edicionRootFormSchema>
// { eventoId, numeroEdicion, nombre, days: DayFormStateInput[] }

export type EdicionWithDaysInput = z.infer<typeof edicionWithDaysSchema>
// { id, eventoId, numeroEdicion, nombre, posterUrl, days: DayFormStateInput[] }
```

### EditionWithDays (store type)

```typescript
// _types/edition.ts
export interface EditionWithDays extends Edition {
  days: DayFormStateInput[]
}
```

### Store interface

```typescript
interface EditionDialogStore {
  isCreateEditionOpen: boolean
  isUpdateEditionOpen: boolean
  selectedEdition: EditionWithDays | null
  toggleCreateEditionDialog: (open: boolean) => void
  openUpdateEditionDialog: (edition: EditionWithDays) => void
  closeUpdateEditionDialog: () => void
}
```

### Dialog props

```typescript
// CreateEditionDialog — receives lookup data
interface CreateEditionDialogProps {
  eventos: EventoLookup[]
  lugares: Place[]
}

// UpdateEditionDialog — receives lookup data, reads selectedEdition from store
interface UpdateEditionDialogProps {
  eventos: EventoLookup[]
  lugares: Place[]
}

// EditionFormLayout — shared, uses useFormContext
interface EditionFormLayoutProps {
  mode: 'create' | 'update'
  eventos: EventoLookup[]
  lugares: Place[]
  selectedEdition?: EditionWithDays | null // For poster display in update mode
}
```

### Row → Store composition

```typescript
// In EditionRow, on edit click:
const editionWithDays: EditionWithDays = {
  ...edition, // PaginatedEdition spreads Edition fields
  days: days.map((day) => ({
    tempId: crypto.randomUUID(),
    existingId: day.id,
    fecha: day.fecha,
    horaInicio: day.horaInicio,
    horaFin: day.horaFin,
    modalidad: day.modalidad,
    lugarId: day.lugarId
  }))
}
store.openUpdateEditionDialog(editionWithDays)
```

## Testing Strategy

| Layer      | What to Test                           | Approach                              |
| ---------- | -------------------------------------- | ------------------------------------- |
| Type check | All imports resolve, no TS errors      | `bun run type-check` after each phase |
| Lint       | Code style compliance                  | `bun run lint` after each phase       |
| Manual     | Create dialog opens, validates, saves  | Browser test                          |
| Manual     | Update dialog pre-fills, saves changes | Browser test                          |
| Manual     | Day dialog validates via RHF           | Browser test                          |

## Migration / Rollout

9 sequential phases (0–8), each independently committable and revertible. Phase order:

0. Fix store naming (unblock all components)
1. Delete 6 dead action files + empty dialog stub
2. Split monolithic schema into 4 files, update all imports
3. Fix remaining broken imports (edition-row, edition-container, place-combobox)
4. Create EditionFormLayout (extract from edition-dialog-form.tsx)
5. Create CreateEditionDialog
6. Create UpdateEditionDialog
7. Rewire EditionsContainer to render split dialogs, delete old dialog files
8. Migrate EdicionDayDialog to RHF

## Open Questions

- [ ] `place-combobox.tsx` imports from `../_actions/add-lugar.action` which doesn't exist — actual file is `create-place.action.ts`. Verify this is the only broken import in that file.
- [ ] `edicionFormSchema` currently picks `eventoId` as `number` from insert schema — confirm this works with RHF `Controller` for Select (Select passes string values, may need coerce).
