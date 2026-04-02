# Tasks: Migrate Ediciones Architecture

## Phase 0: Fix Imports Survivors

### 0.1 — Fix `edition-row.tsx` survivor imports

**Effort**: 20m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-row.tsx`, `src/app/(core)/eventos/ediciones/_actions/delete-edition.action.ts`, `src/app/(core)/eventos/ediciones/_schemas/edicion.schema.ts`
**Action**:

- [x] Update schema imports from `../schemas/edition.schema`-style usage to the current private module path `../_schemas/edicion.schema`
- [x] Replace the broken delete action import usage so the component consumes the currently exported action name, then align local variable names (`edition`, `days`, `places`, `events`) with actual props
- [x] Remove stale identifiers like `edicion`, `dias`, `lugares`, and `eventos` that currently make the file uncompilable
- [x] Confirm the row still opens the edit flow and delete flow through the expected store/action APIs

**Code Example** (for schema/components):

```typescript
import { deleteEdicionAction } from '../_actions/delete-edition.action'
import type { EditionDay } from '../_schemas/edicion.schema'
import type { Place } from '../_schemas/place.schema'

const sortedDays = [...days].sort(
  (left, right) =>
    new Date(left.fecha).getTime() - new Date(right.fecha).getTime()
)
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] `edition-row.tsx` no longer references undefined Spanish variable names

**Dependencies**: None

### 0.2 — Fix `edition-container.tsx` store wiring and variable names

**Effort**: 25m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-container.tsx`, `src/app/(core)/eventos/ediciones/_store/edition-dialog-store.ts`
**Action**:

- [x] Replace broken imports such as `../store/edicion-dialog-store` with `../_store/edition-dialog-store`
- [x] Rename local state accessors from Spanish names (`useEdicionDialog`, `openDialog`, `onClearFilters`, `ediciones`) to the actual store and handler APIs that exist or will exist in the migration
- [x] Restore missing imports referenced by the JSX, including the empty state (using `@/shared/components/empty-state`) and dialog components if required for Phase 0 compilation
- [x] Make the add button call the create-dialog store method instead of the removed monolithic `openDialog(null)` flow
- [x] Remove `EditionsDialog` reference (replaced in Phase 4)

**Code Example** (for schema/components):

```typescript
import { useEditionDialog } from '../_store/edition-dialog-store'

const toggleCreateEditionDialog = useEditionDialog(
  (state) => state.toggleCreateEditionDialog
)

<Button onClick={() => toggleCreateEditionDialog(true)}>
  <IconPlus />
  Agregar Edición
</Button>
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] `edition-container.tsx` no longer references removed `openDialog` / `useEdicionDialog` APIs

**Dependencies**: None

### 0.3 — Fix `place-combobox.tsx` broken action import

**Effort**: 15m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_components/place-combobox.tsx`, `src/app/(core)/eventos/ediciones/_actions/create-place.action.ts`
**Action**:

- [x] Replace the broken action import `../actions/add-lugar.action` with the real file `../_actions/create-place.action`
- [x] Rename export `addLugarAction` → `createPlaceAction` (aligned with Phase 5 early)
- [x] Verify the component still sends the expected payload shape for place creation and note the later typed-input refactor in Phase 7

**Code Example** (for schema/components):

```typescript
import { createPlaceAction } from '../_actions/create-place.action'
import type { Place } from '../_schemas/edicion.schema'
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] `place-combobox.tsx` resolves the create-place action from the correct file

**Dependencies**: None

### 0.4 — Verify `page.tsx` compiles and renders after survivor fixes

**Effort**: 15m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/page.tsx`, `src/app/(core)/eventos/ediciones/_components/edition-container.tsx`, `src/app/(core)/eventos/ediciones/_components/edition-row.tsx`, `src/app/(core)/eventos/ediciones/_components/place-combobox.tsx`
**Action**:

- [x] Run the ediciones route through TypeScript after fixing survivor imports
- [x] Confirm `page.tsx` still composes editions, days, places, and events without changing the server data flow
- [ ] Treat any remaining compile errors in the rendered tree as blockers before Phase 1 deletion work begins (NOTE: type-check still fails due to other legacy components that will be replaced in Phase 4)

**Code Example** (for schema/components):

```typescript
return (
  <EditionsContainer
    editions={editions}
    days={days}
    places={places}
    events={events}
    pagination={{ ...editionsResult, data: editions }}
  />
)
```

**Verify**:

- [x] `bun run lint` passes (with pre-existing warnings in other files)
- [x] Fixed files (edition-row, edition-container, place-combobox) have no new import errors
- [ ] `bun run type-check` passes — **BLOCKED** by legacy components (edition-dialog.tsx, edition-dialog-form.tsx, edition-day-dialog.tsx) to be replaced in Phase 4

**Dependencies**: 0.1, 0.2, 0.3

## Phase 1: Delete Dead Code

### 1.1 — Delete obsolete create edition action

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/create-edition.action.ts`
**Action**:

- [x] Delete `_actions/create-edition.action.ts`
- [x] Search for imports to this file and replace or remove any remaining references in the same pass

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Creation is handled by save-edition-with-days.action.ts
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows no references to `create-edition.action`

**Dependencies**: 0.4

### 1.2 — Delete obsolete create edition day action

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/create-edition-day.action.ts`
**Action**:

- [x] Delete `_actions/create-edition-day.action.ts`
- [x] Remove any imports or references that still point to the standalone day-create action

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Day persistence is handled by save-edition-with-days.action.ts
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows no references to `create-edition-day.action`

**Dependencies**: 0.4

### 1.3 — Delete obsolete update edition action

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/update-edition.action.ts`
**Action**:

- [x] Delete `_actions/update-edition.action.ts`
- [x] Remove or update any remaining references to the standalone edition-update action

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Update is handled by save-edition-with-days.action.ts
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows no references to `update-edition.action`

**Dependencies**: 0.4

### 1.4 — Delete obsolete update edition day action

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/update-edition-day.action.ts`
**Action**:

- [x] Delete `_actions/update-edition-day.action.ts`
- [x] Remove or update any remaining references to the standalone day-update action

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Nested day updates are handled in the transactional save action.
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows no references to `update-edition-day.action`

**Dependencies**: 0.4

### 1.5 — Delete obsolete delete edition day action

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/delete-edition-day.action.ts`
**Action**:

- [x] Delete `_actions/delete-edition-day.action.ts`
- [x] Remove any remaining references so day deletion is managed only through the transactional parent save flow

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Day removal should happen via edited `days` payload submission.
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows no references to `delete-edition-day.action`

**Dependencies**: 0.4

### 1.6 — Delete obsolete create dialog component

**Effort**: 10m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-create-dialog.tsx`
**Action**:

- [x] Delete `_components/edition-create-dialog.tsx`
- [x] Remove or replace imports so future create flow uses the new split dialog components introduced in Phase 4

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Replacement: CreateEditionDialog in Phase 4.
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] No source file imports `edition-create-dialog.tsx`

**Dependencies**: 0.4

### 1.7 — Delete unused hooks directory

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_hooks/`
**Action**:

- [x] Delete the entire `_hooks/` directory
- [x] Search for surviving imports from `_hooks/` and remove or replace them before continuing

**Code Example** (for schema/components):

```typescript
// Directory should be deleted.
// Surviving behavior should live in components, schemas, or store modules.
```

**Verify**:

- [x] `bun run type-check` passes (same errors as before from legacy components)
- [x] No import errors
- [x] Repository search shows zero references to `_hooks/`

**Dependencies**: 0.4

## Phase 2: Split Schema

### 2.1 — Create `edition.schema.ts` with edition-specific schemas and coerced form input

**Effort**: 45m
**Risk**: High
**Files**: `src/app/(core)/eventos/ediciones/_schemas/edition.schema.ts`
**Action**:

- [x] Create `_schemas/edition.schema.ts` with `editionSelectSchema`, `edicionInsertSchema`, `edicionUpdateSchema`, and `edicionFormSchema`
- [x] Derive all edition runtime/input types from the schemas: `Edition`, `EdicionInsertInput`, `EdicionUpdateInput`, `EdicionFormInput`
- [x] Handle the Select string-to-number mismatch by coercing `eventoId` in the form schema via `z.coerce.number().int().positive()` so RHF + Select remain compatible
- [x] Keep Spanish validation messages and Drizzle-Zod derivation consistent with project conventions

**Code Example** (for schema/components):

```typescript
import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { eventEdition } = events

export const editionSelectSchema = createSelectSchema(eventEdition).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionInsertSchema = createInsertSchema(eventEdition, {
  eventoId: () => z.number().int().positive(),
  numeroEdicion: (schema) =>
    schema.min(1, { message: 'El número de edición es obligatorio' }),
  slug: (schema) => schema.min(1, { message: 'El slug es obligatorio' })
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const edicionFormSchema = edicionInsertSchema
  .pick({
    eventoId: true,
    numeroEdicion: true,
    nombre: true,
    posterUrl: true
  })
  .extend({
    eventoId: z.coerce.number().int().positive({
      message: 'El evento es obligatorio'
    })
  })

export type Edition = z.infer<typeof editionSelectSchema>
export type EdicionInsertInput = z.infer<typeof edicionInsertSchema>
export type EdicionUpdateInput = z.infer<typeof edicionUpdateSchema>
export type EdicionFormInput = z.infer<typeof edicionFormSchema>
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] `eventoId` accepts Select string values and validates as a number

**Dependencies**: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7

### 2.2 — Create `edition-day.schema.ts` for day persistence and dialog state

**Effort**: 40m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_schemas/edition-day.schema.ts`
**Action**:

- [x] Create `_schemas/edition-day.schema.ts` with `editionDaySelectSchema`, `edicionDiaInsertSchema`, `edicionDiaUpdateSchema`, and `dayFormStateSchema`
- [x] Export schema-derived types `EditionDay`, `EdicionDiaInsertInput`, and `DayFormStateInput`
- [x] Preserve nullable `lugarId` and optional `existingId` behavior required by update/edit flows
- [x] Keep day-form validation messages centralized here so Phase 8 can delete manual validation logic

**Code Example** (for schema/components):

```typescript
export const dayFormStateSchema = z.object({
  tempId: z.string(),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: z
    .string()
    .min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: z.string().min(1, { message: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido']).nullable(),
  lugarId: z.number().int().positive().nullable(),
  existingId: z.number().int().positive().optional()
})

export type EditionDay = z.infer<typeof editionDaySelectSchema>
export type EdicionDiaInsertInput = z.infer<typeof edicionDiaInsertSchema>
export type DayFormStateInput = z.infer<typeof dayFormStateSchema>
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] Day dialog and table consumers can import day types from the split schema module

**Dependencies**: 2.1

### 2.3 — Create `place.schema.ts` for place selection and insertion

**Effort**: 30m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_schemas/place.schema.ts`, `src/app/(core)/eventos/ediciones/_actions/create-place.action.ts`
**Action**:

- [x] Create `_schemas/place.schema.ts` with `placeSelectSchema` and `lugarInsertSchema`
- [x] Export schema-derived types `Place` and `LugarInsertInput`
- [x] Move place-related validation out of the monolithic schema file so `create-place.action.ts` can import only place concerns
- [x] Preserve nullable/optional URL validation semantics from the current implementation

**Code Example** (for schema/components):

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { core } from '@frijolmagico/database/schema'

const { place } = core

export const placeSelectSchema = createSelectSchema(place, {
  url: z.url().nullable()
}).omit({
  createdAt: true,
  updatedAt: true
})

export const lugarInsertSchema = createInsertSchema(place, {
  nombre: (schema) => schema.min(1, { message: 'El nombre es obligatorio' }),
  url: z.url({ error: 'La URL debe ser válida' }).nullable().optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export type Place = z.infer<typeof placeSelectSchema>
export type LugarInsertInput = z.infer<typeof lugarInsertSchema>
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] Place consumers import from `place.schema.ts` instead of `edicion.schema.ts`

**Dependencies**: 2.1

### 2.4 — Create `edition-composite.schema.ts` for root form composition

**Effort**: 30m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_schemas/edition-composite.schema.ts`
**Action**:

- [x] Create `_schemas/edition-composite.schema.ts` importing from `edition.schema.ts` and `edition-day.schema.ts`
- [x] Define `edicionRootFormSchema` and export `EdicionRootFormInput`
- [x] Keep composite concerns limited to form composition so consumers stop importing unrelated table schemas from one giant file

**Code Example** (for schema/components):

```typescript
import { z } from 'zod'
import { edicionFormSchema } from './edition.schema'
import { dayFormStateSchema } from './edition-day.schema'

export const edicionRootFormSchema = edicionFormSchema
  .omit({ posterUrl: true })
  .extend({
    days: z.array(dayFormStateSchema)
  })

export type EdicionRootFormInput = z.infer<typeof edicionRootFormSchema>
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] Parent form components import composite state from `edition-composite.schema.ts`

**Dependencies**: 2.1, 2.2

### 2.5 — Rewrite all schema consumer imports to the split modules

**Effort**: 35m
**Risk**: High
**Files**: `src/app/(core)/eventos/ediciones/**/*.{ts,tsx}`
**Action**:

- [x] Search for all imports from `edicion.schema.ts` and map each consumer to the new split schema module it actually needs
- [x] Update all consuming files, including actions, components, store, and types, so they import only the minimum required symbol
- [x] Use repository search after the rewrite to confirm no consumer still references the monolithic schema file except the deletion task itself
- [x] Treat `bun run type-check` immediately after this import rewrite as the phase gate for schema split correctness

**Code Example** (for schema/components):

```typescript
import type { Edition } from '../_schemas/edition.schema'
import type {
  EditionDay,
  DayFormStateInput
} from '../_schemas/edition-day.schema'
import type { Place } from '../_schemas/place.schema'
import { edicionRootFormSchema } from '../_schemas/edition-composite.schema'
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] Repository search shows no remaining imports from `../_schemas/edicion.schema`
- [ ] `bun run type-check` confirms all schema split imports work before Phase 3

**Dependencies**: 2.1, 2.2, 2.3, 2.4

### 2.6 — Add form ID constants for split dialogs

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_constants/index.ts`
**Action**:

- [x] Add `CREATE_EDITION_FORM_ID` and `UPDATE_EDITION_FORM_ID` constants to `_constants/index.ts`
- [x] Keep naming aligned with the artist dialog pattern so Phase 4 can wire `EntityFormDialog submit={{ form }}` consistently

**Code Example** (for schema/components):

```typescript
export const EDITION_CACHE_TAG = 'admin:edition'
export const EDITION_DAY_CACHE_TAG = 'admin:edition:day'
export const PLACE_CACHE_TAG = 'admin:edition:place'

export const CREATE_EDITION_FORM_ID = 'create-edition-form'
export const UPDATE_EDITION_FORM_ID = 'update-edition-form'
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] New dialog components can import both form IDs from one constants module

**Dependencies**: 2.5

### 2.7 — Delete the monolithic `edicion.schema.ts`

**Effort**: 10m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_schemas/edicion.schema.ts`
**Action**:

- [x] Delete the legacy monolithic schema file after all consumers have been migrated
- [x] Re-run repository search to confirm nothing imports the deleted file path
- [x] Treat any surviving reference as a blocker before moving to the store phase

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Replacement modules:
// - edition.schema.ts
// - edition-day.schema.ts
// - place.schema.ts
// - edition-composite.schema.ts
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] `src/app/(core)/eventos/ediciones/_schemas/edicion.schema.ts` no longer exists

**Dependencies**: 2.5, 2.6

## Phase 3: Verify Store

### 3.1 — Update dialog store to use `EditionWithDays`

**Effort**: 20m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_store/edition-dialog-store.ts`, `src/app/(core)/eventos/ediciones/_types/edition.ts`, `src/app/(core)/eventos/ediciones/_schemas/edition-composite.schema.ts`
**Action**:

- [x] Change store typing from `Edition | null` to `EditionWithDays | null`
- [x] Update the `openUpdateEditionDialog` API to require a composed edition payload instead of a bare edition or nullable ID-based flow
- [x] Import the type from the canonical module introduced by the migration and keep the store export name in English: `useEditionDialog`

**Code Example** (for schema/components):

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

**Verify**:

- [x] `bun run type-check` passes (ediciones clean, pre-existing errors in other modules)
- [x] No import errors
- [x] Store selection matches the update dialog data contract

**Dependencies**: 2.4, 2.5, 2.7

### 3.2 — Verify all store imports resolve to the English store module

**Effort**: 15m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-container.tsx`, `src/app/(core)/eventos/ediciones/_components/edition-row.tsx`, `src/app/(core)/eventos/ediciones/**/*.{ts,tsx}`
**Action**:

- [ ] Search for old store paths and names such as `../_store/edicion-dialog-store` and `useEdicionDialog`
- [ ] Update every consumer to import `useEditionDialog` from `../_store/edition-dialog-store`
- [ ] Confirm there is only one dialog-store source of truth after the rename cleanup

**Code Example** (for schema/components):

```typescript
import { useEditionDialog } from '../_store/edition-dialog-store'

const selectedEdition = useEditionDialog((state) => state.selectedEdition)
```

**Verify**:

- [x] `bun run type-check` passes (ediciones clean)
- [x] No import errors
- [x] Repository search shows no remaining `useEdicionDialog` or `edicion-dialog-store` imports

**Dependencies**: 3.1

## Phase 4: Migrate Dialog Components

### 4.1 — Create `EditionFormLayout.tsx` using RHF context and field arrays

**Effort**: 1h 15m
**Risk**: High
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-form-layout.tsx`, `src/app/(core)/eventos/ediciones/_components/edition-day-dialog.tsx`, `src/app/(core)/eventos/ediciones/_components/edition-days-table.tsx`, `src/app/(core)/eventos/ediciones/_components/poster-section.tsx`, `src/app/(core)/eventos/ediciones/_components/poster-preview.tsx`
**Action**:

- [x] Extract the shared form body from `edition-dialog-form.tsx` into `EditionFormLayout.tsx`
- [x] Use `useFormContext` and `useFieldArray({ name: 'days' })` instead of embedding a full `useForm` in the layout component
- [x] Accept `mode: 'create' | 'update'`, lookup lists, and optionally `selectedEdition` for poster preview handling
- [x] Keep the days section integrated with the day dialog/table workflow so both create and update dialogs reuse one layout

**Code Example** (for schema/components):

```typescript
'use client'

import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import type { EdicionRootFormInput } from '../_schemas/edition-composite.schema'

interface EditionFormLayoutProps {
  mode: 'create' | 'update'
  eventos: EventoLookup[]
  lugares: Place[]
  selectedEdition?: EditionWithDays | null
}

export function EditionFormLayout({
  mode,
  eventos,
  lugares,
  selectedEdition
}: EditionFormLayoutProps) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<EdicionRootFormInput>()
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'days'
  })

  // shared layout logic here
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Shared layout renders both root fields and nested days controls through RHF context

**Dependencies**: 3.2

### 4.2 — Create `CreateEditionDialog.tsx` with `FormProvider` and empty defaults

**Effort**: 45m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/create-edition-dialog.tsx`, `src/app/(core)/eventos/ediciones/_constants/index.ts`, `src/app/(core)/eventos/ediciones/_actions/save-edition-with-days.action.ts`
**Action**:

- [x] Create `CreateEditionDialog.tsx` following the artistas `CreateArtistDialog` pattern
- [x] Wrap the dialog content with `FormProvider` and use `EntityFormDialog` submit wiring via `CREATE_EDITION_FORM_ID`
- [x] Initialize `useForm` with an explicit `emptyForm` object and `zodResolver(edicionRootFormSchema)`
- [x] Submit through `save-edition-with-days.action.ts`, reset on success, and close the create dialog cleanly

**Code Example** (for schema/components):

```typescript
const emptyForm: EdicionRootFormInput = {
  eventoId: undefined as never,
  numeroEdicion: '',
  nombre: null,
  days: []
}

const methods = useForm<EdicionRootFormInput>({
  resolver: zodResolver(edicionRootFormSchema),
  defaultValues: emptyForm,
  mode: 'onChange'
})
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Create dialog opens with empty values and submits through the shared action

**Dependencies**: 4.1, 2.6

### 4.3 — Create `UpdateEditionDialog.tsx` with `values: selectedEdition ?? emptyForm`

**Effort**: 45m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/update-edition-dialog.tsx`, `src/app/(core)/eventos/ediciones/_store/edition-dialog-store.ts`
**Action**:

- [ ] Create `UpdateEditionDialog.tsx` following the artistas `UpdateArtistDialog` pattern
- [ ] Read `selectedEdition` from `useEditionDialog` and return `null` early when no selection exists
- [ ] Initialize RHF with `values: selectedEdition ?? emptyForm` so dialog state follows store changes without manual reset orchestration
- [ ] Submit updates through `save-edition-with-days.action.ts` and close/reset after success

**Code Example** (for schema/components):

```typescript
const methods = useForm<EdicionRootFormInput>({
  resolver: zodResolver(edicionRootFormSchema),
  values: selectedEdition ?? emptyForm,
  mode: 'onChange'
})

if (!selectedEdition) {
  return null
}
```

**Verify**:

- [ ] `bun run type-check` passes
- [ ] No import errors
- [ ] Update dialog opens with pre-filled values from store-selected edition data

**Dependencies**: 4.1, 3.1, 2.6

### 4.4 — Refactor `edition-container.tsx` to render split dialogs and accept composed data

**Effort**: 35m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-container.tsx`, `src/app/(core)/eventos/ediciones/page.tsx`
**Action**:

- [ ] Replace monolithic dialog rendering with `CreateEditionDialog` and `UpdateEditionDialog`
- [ ] Ensure the container receives the composed editions list already built in `page.tsx` and forwards lookup data to both dialogs
- [ ] Remove the old `EditionsDialog` dependency and update button handlers to the new store APIs
- [x] Keep pagination and filters behavior untouched during the dialog migration

**Code Example** (for schema/components):

```typescript
<CreateEditionDialog eventos={events} lugares={places} />
<UpdateEditionDialog eventos={events} lugares={places} />
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Container renders both split dialogs without using the legacy monolithic dialog

**Dependencies**: 4.2, 4.3

### 4.5 — Delete `edition-dialog-form.tsx`

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-dialog-form.tsx`
**Action**:

- [x] Delete the legacy form component after its logic has been fully extracted into `EditionFormLayout.tsx`
- [x] Remove any surviving imports to the deleted file

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Replacement: EditionFormLayout + split dialog components.
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No source file imports `edition-dialog-form.tsx`

**Dependencies**: 4.1, 4.2, 4.3, 4.4

### 4.6 — Delete `edition-dialog.tsx`

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-dialog.tsx`
**Action**:

- [x] Delete the monolithic dialog shell after both split dialogs are wired into the container
- [x] Remove any imports or references to the deleted monolithic dialog component

**Code Example** (for schema/components):

```typescript
// File should be deleted.
// Replacement: CreateEditionDialog + UpdateEditionDialog.
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No source file imports `edition-dialog.tsx`

**Dependencies**: 4.4

## Phase 5: Standardize Naming

### 5.1 — Rename create place action export to `createPlaceAction`

**Effort**: 20m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_actions/create-place.action.ts`, `src/app/(core)/eventos/ediciones/_components/place-combobox.tsx`
**Action**:

- [x] Rename the exported server action from `addLugarAction` to `createPlaceAction`
- [x] Update imports in all consumers, starting with `place-combobox.tsx`
- [x] Keep Spanish UI strings unchanged while standardizing code-facing API naming to English

**Code Example** (for schema/components):

```typescript
export async function createPlaceAction(
  _prevState: ActionState<{ id: number }>,
  payload: LugarInsertInput
): Promise<ActionState<{ id: number }>> {
  // implementation
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No consumer imports `addLugarAction`

**Dependencies**: 4.4

### 5.2 — Rename delete edition action export to `deleteEditionAction`

**Effort**: 15m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_actions/delete-edition.action.ts`, `src/app/(core)/eventos/ediciones/_components/edition-row.tsx`
**Action**:

- [x] Rename the exported delete action from `deleteEdicionAction` to `deleteEditionAction`
- [x] Update all consuming imports so row actions use the English code-facing name
- [x] Keep entity type strings in returned action errors unchanged if they are user-facing or persistence-facing

**Code Example** (for schema/components):

```typescript
export async function deleteEditionAction(
  _prevState: ActionState<void>,
  payload: { id: number }
): Promise<ActionState<void>> {
  // implementation
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No consumer imports `deleteEdicionAction`

**Dependencies**: 4.4

### 5.3 — Update all imports to the new English action exports

**Effort**: 15m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/**/*.{ts,tsx}`
**Action**:

- [x] Search for every import of renamed action exports and update them to the English names
- [x] Confirm components, forms, and tests (if any) all compile against the renamed action APIs
- [x] Keep this rewrite isolated to import sites so behavior stays unchanged

**Code Example** (for schema/components):

```typescript
import { createPlaceAction } from '../_actions/create-place.action'
import { deleteEditionAction } from '../_actions/delete-edition.action'
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Repository search shows only English action export names in source imports

**Dependencies**: 5.1, 5.2

### 5.4 — Verify no Spanish export names remain in action APIs

**Effort**: 10m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/**/*.ts`, `src/app/(core)/eventos/ediciones/**/*.{ts,tsx}`
**Action**:

- [x] Search all action exports in the ediciones module for remaining Spanish code-facing names
- [x] Clean up any survivor names that still end in `Action` but expose Spanish nouns in code
- [x] Document any intentional exceptions as user-visible labels only, not code symbols

**Code Example** (for schema/components):

```typescript
// Expected surviving exports:
// createPlaceAction
// deleteEditionAction
// saveEditionWithDaysAction (or existing English-standardized equivalent)
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Grep/search confirms no Spanish `Action` export names remain

**Dependencies**: 5.3

## Phase 6: Clean Up Types

### 6.1 — Remove manual form/error types from `_types/edition.ts`

**Effort**: 25m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_types/edition.ts`, `src/app/(core)/eventos/ediciones/_schemas/edition-day.schema.ts`, `src/app/(core)/eventos/ediciones/_schemas/edition.schema.ts`
**Action**:

- [x] Remove `DayFormState`, `EdicionFormState`, `Modality`, and `DayFieldErrors` from `_types/edition.ts`
- [x] Replace them with schema-derived imports such as `DayFormStateInput` and any locally justified utility type aliases that still add real value
- [x] If modality still needs a reusable type guard, derive it from schema-compatible literals instead of keeping a duplicated manual form-state contract

**Code Example** (for schema/components):

```typescript
import type { Edition } from '../_schemas/edition.schema'
import type { DayFormStateInput } from '../_schemas/edition-day.schema'

export interface EditionWithDays extends Edition {
  days: DayFormStateInput[]
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] `_types/edition.ts` no longer duplicates form-state or error-shape definitions

**Dependencies**: 5.4

### 6.2 — Clean `_types/index.ts` re-exports

**Effort**: 15m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_types/index.ts`
**Action**:

- [x] Update `_types/index.ts` so it re-exports from the split schema modules instead of the deleted monolithic schema
- [x] Keep `EventoLookup` intact while ensuring edition/day/place types point to their new homes
- [x] Remove any re-export that no longer provides value after schema split

**Code Example** (for schema/components):

```typescript
export type { Edition } from '../_schemas/edition.schema'
export type { EditionDay } from '../_schemas/edition-day.schema'
export type { Place } from '../_schemas/place.schema'
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Re-export module resolves only valid split-schema paths

**Dependencies**: 6.1

### 6.3 — Verify all types derive from schemas without manual duplicates

**Effort**: 20m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_types/**/*.ts`, `src/app/(core)/eventos/ediciones/_schemas/**/*.ts`, `src/app/(core)/eventos/ediciones/**/*.{ts,tsx}`
**Action**:

- [x] Search the module for duplicated manual interfaces that mirror schema shapes
- [x] Keep only legitimate extension types such as `PaginatedEdition` or `EditionWithDays` when they add composition value beyond a single schema
- [x] Confirm all form payloads, dialog values, and server-action inputs now flow from schema-derived types

**Code Example** (for schema/components):

```typescript
// Keep composed extension types only when they add new structure.
export interface EditionWithDays extends Edition {
  days: DayFormStateInput[]
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No manual interfaces duplicate schema-defined form payloads

**Dependencies**: 6.2

## Phase 7: Action Standardization

### 7.1 — Convert `create-place.action.ts` to typed input instead of `FormData`

**Effort**: 35m
**Risk**: Medium
**Files**: `src/app/(core)/eventos/ediciones/_actions/create-place.action.ts`, `src/app/(core)/eventos/ediciones/_components/place-combobox.tsx`, `src/app/(core)/eventos/ediciones/_schemas/place.schema.ts`
**Action**:

- [x] Change the place creation action signature from `FormData` to a typed object payload validated by `lugarInsertSchema`
- [x] Update `place-combobox.tsx` to build and send a typed object rather than manually appending to `FormData`
- [x] Reuse the split place schema types so client and server validation stay aligned
- [x] Preserve current success/error response shape so the combobox UX stays unchanged

**Code Example** (for schema/components):

```typescript
const payload: LugarInsertInput = {
  nombre,
  direccion: newLugar.direccion || null,
  ciudad: newLugar.ciudad || null,
  url: newLugar.url || null
}

const result = await createPlaceAction({ success: false }, payload)
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] `create-place.action.ts` no longer accepts or parses `FormData`

**Dependencies**: 5.4, 6.3

### 7.2 — Verify `save-edition-with-days.action.ts` remains the correct transactional action

**Effort**: 20m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_actions/save-edition-with-days.action.ts`, `src/app/(core)/eventos/ediciones/_components/create-edition-dialog.tsx`, `src/app/(core)/eventos/ediciones/_components/update-edition-dialog.tsx`
**Action**:

- [x] Review `save-edition-with-days.action.ts` against the new schema exports and dialog payloads
- [x] Confirm no refactor is needed beyond import/type updates required by the schema split and naming cleanup
- [x] Verify both create and update dialogs submit the expected typed payload to this single transactional action

**Code Example** (for schema/components):

```typescript
const result = await saveEditionWithDaysAction(
  { success: false },
  {
    id: selectedEdition?.id ?? null,
    eventoId: data.eventoId,
    numeroEdicion: data.numeroEdicion,
    nombre: data.nombre,
    posterUrl: selectedEdition?.posterUrl ?? null,
    days: data.days
  }
)
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Both create and update flows submit through the same transactional action without extra CRUD files

**Dependencies**: 4.2, 4.3, 7.1

## Phase 8: Day Dialog RHF Migration

### 8.1 — Migrate `edition-day-dialog.tsx` to RHF + `zodResolver(dayFormStateSchema)`

**Effort**: 1h
**Risk**: High
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-day-dialog.tsx`, `src/app/(core)/eventos/ediciones/_schemas/edition-day.schema.ts`, `src/app/(core)/eventos/ediciones/_components/place-combobox.tsx`
**Action**:

- [x] Replace `useState`-driven day form state with `useForm<DayFormStateInput>` and `zodResolver(dayFormStateSchema)`
- [x] Initialize the form from `initialDay ?? createEmptyDayState()` and sync dialog save through `handleSubmit`
- [x] Use RHF-compatible field bindings for date, time, select, and place controls so validation errors come from the resolver instead of manual state
- [x] Keep `onSave` payloads schema-valid and compatible with `useFieldArray` rows in `EditionFormLayout`

**Code Example** (for schema/components):

```typescript
const methods = useForm<DayFormStateInput>({
  resolver: zodResolver(dayFormStateSchema),
  values: initialDay ?? createEmptyDayState(),
  mode: 'onChange'
})

const onSubmit = (data: DayFormStateInput) => {
  onSave(data)
  onClose()
}
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] Day dialog errors come from RHF resolver-backed validation instead of local state

**Dependencies**: 4.1, 7.1

### 8.2 — Delete manual `validateDay()` logic and `DayFieldErrors` usage

**Effort**: 20m
**Risk**: Low
**Files**: `src/app/(core)/eventos/ediciones/_components/edition-day-dialog.tsx`, `src/app/(core)/eventos/ediciones/_types/edition.ts`
**Action**:

- [x] Remove the `validateDay()` helper entirely from `edition-day-dialog.tsx`
- [x] Remove any remaining `DayFieldErrors` usage now that RHF owns validation state
- [x] Confirm the dialog submits only through `handleSubmit` and renders field errors from RHF form state

**Code Example** (for schema/components):

```typescript
const {
  control,
  handleSubmit,
  formState: { errors }
} = methods

<Button type='button' onClick={handleSubmit(onSubmit)}>
  Guardar cambios
</Button>
```

**Verify**:

- [x] `bun run type-check` passes
- [x] No import errors
- [x] No `validateDay` function or `DayFieldErrors` type remains in the ediciones module

**Dependencies**: 8.1, 6.1

---

## Migration Complete ✅

All phases 0-8 completed. The ediciones module now follows the same architecture pattern as eventos and artistas.
