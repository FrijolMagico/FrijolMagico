import { z } from 'zod'
import { artistInsertSchema } from './artista.schema'

const pseudonymTextSchema = z
  .string()
  .trim()
  .min(1, { error: 'El pseudónimo es obligatorio' })

export const createArtistWithPseudonymsSchema = z
  .object({
    artist: artistInsertSchema.omit({ pseudonimo: true }),
    pseudonyms: z
      .array(pseudonymTextSchema)
      .min(1, { error: 'El artista debe tener al menos un pseudónimo' })
      .refine((names) => new Set(names.map((name) => name.toLocaleLowerCase())).size === names.length, {
        error: 'No se pueden repetir pseudónimos'
      }),
    primaryPseudonym: pseudonymTextSchema
  })
  .superRefine(({ pseudonyms, primaryPseudonym }, context) => {
    if (!pseudonyms.includes(primaryPseudonym)) {
      context.addIssue({
        code: 'custom',
        path: ['primaryPseudonym'],
        message: 'El pseudónimo principal debe estar en la lista'
      })
    }
  })

const artistIdSchema = z.number().int().positive({ error: 'ID de artista inválido' })
const pseudonymIdSchema = z.number().int().positive({ error: 'ID de pseudónimo inválido' })

export const artistPseudonymDraftSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('edit'),
    pseudonymId: pseudonymIdSchema.nullable(),
    pseudonym: pseudonymTextSchema,
    preserveHistory: z.boolean(),
    makePrimary: z.boolean()
  }),
  z.object({
    operation: z.literal('add'),
    pseudonym: pseudonymTextSchema,
    makePrimary: z.boolean()
  })
])

export type ArtistPseudonymDraftInput = z.infer<typeof artistPseudonymDraftSchema>
export type ArtistPseudonymEditorDraft = ArtistPseudonymDraftInput & {
  originalText: string
}
export type ArtistPseudonymDraftState = Record<string, ArtistPseudonymEditorDraft>

export function normalizePseudonymText(value: string): string {
  return value.trim()
}

export function hasPseudonymTextChanged(pseudonym: string, originalText: string): boolean {
  return normalizePseudonymText(pseudonym) !== normalizePseudonymText(originalText)
}

export function preserveHistoryForPseudonymText(
  pseudonym: string,
  originalText: string,
  requested: boolean
): boolean {
  return hasPseudonymTextChanged(pseudonym, originalText) && requested
}

export interface ArtistPseudonymCheckboxStateInput {
  adding: boolean
  selectedId: number | null
  options: { id: number; isPrimary: boolean }[]
  drafts: ArtistPseudonymDraftState
  currentText: string
  originalText: string
}

export interface ArtistPseudonymCheckboxState {
  preserveHistory: boolean
  historyDisabled: boolean
  makePrimary: boolean
  primaryDisabled: boolean
}

export function getArtistPseudonymCheckboxState({
  adding,
  selectedId,
  options,
  drafts,
  currentText,
  originalText
}: ArtistPseudonymCheckboxStateInput): ArtistPseudonymCheckboxState {
  const changed = hasPseudonymTextChanged(currentText, originalText)
  const currentKey = adding ? 'new' : selectedId === null ? 'primary' : String(selectedId)
  const currentDraft = drafts[currentKey]
  const pendingPrimaryKey = Object.entries(drafts).find(([, draft]) => draft.makePrimary)?.[0]
  const persistedPrimary = options.find((option) => option.isPrimary)
  const effectivePrimaryKey = pendingPrimaryKey
    ?? (persistedPrimary ? String(persistedPrimary.id) : 'primary')
  const currentIdentityKey = adding
    ? 'new'
    : selectedId === null && persistedPrimary
      ? String(persistedPrimary.id)
      : currentKey
  const isEffectivePrimary = currentIdentityKey === effectivePrimaryKey

  return {
    preserveHistory: changed && currentDraft?.operation === 'edit' && currentDraft.preserveHistory,
    historyDisabled: adding || !changed,
    makePrimary: isEffectivePrimary,
    primaryDisabled: isEffectivePrimary
  }
}

export interface NewArtistPseudonymDraft {
  id: number
  pseudonym: string
}

export interface NewArtistPseudonymState {
  drafts: NewArtistPseudonymDraft[]
  primaryId: number
  nextId: number
}

export function createNewArtistPseudonymState(): NewArtistPseudonymState {
  return { drafts: [{ id: 0, pseudonym: '' }], primaryId: 0, nextId: 1 }
}

export function addNewArtistPseudonym(
  state: NewArtistPseudonymState
): NewArtistPseudonymState {
  const id = state.nextId
  return {
    drafts: [...state.drafts, { id, pseudonym: '' }],
    primaryId: state.primaryId,
    nextId: id + 1
  }
}

export function updateNewArtistPseudonym(
  state: NewArtistPseudonymState,
  id: number,
  pseudonym: string
): NewArtistPseudonymState {
  return {
    ...state,
    drafts: state.drafts.map((draft) => draft.id === id ? { ...draft, pseudonym } : draft)
  }
}

export function makeNewArtistPseudonymPrimary(
  state: NewArtistPseudonymState,
  id: number
): NewArtistPseudonymState {
  return state.drafts.some((draft) => draft.id === id) ? { ...state, primaryId: id } : state
}

export function upsertPseudonymDraft(
  drafts: ArtistPseudonymDraftState,
  key: string,
  draft: ArtistPseudonymEditorDraft
): ArtistPseudonymDraftState {
  return { ...drafts, [key]: draft }
}

export function clearPseudonymDrafts(): ArtistPseudonymDraftInput[] {
  return []
}

export function persistablePseudonymDrafts(
  drafts: ArtistPseudonymDraftState
): ArtistPseudonymDraftInput[] {
  return Object.values(drafts)
    .filter((draft) => draft.operation === 'add'
      ? normalizePseudonymText(draft.pseudonym).length > 0
      : hasPseudonymTextChanged(draft.pseudonym, draft.originalText) || draft.makePrimary)
    .map(({ originalText: _originalText, ...draft }) => draft)
}

export const artistPseudonymMutationSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('rename'),
    artistId: artistIdSchema,
    pseudonymId: pseudonymIdSchema,
    pseudonym: pseudonymTextSchema,
    preserveHistory: z.boolean().default(false)
  }),
  z.object({
    operation: z.literal('set-primary'),
    artistId: artistIdSchema,
    pseudonymId: pseudonymIdSchema
  }),
  z.object({
    operation: z.literal('add'),
    artistId: artistIdSchema,
    pseudonym: pseudonymTextSchema,
    makePrimary: z.boolean().default(false)
  }),
  z.object({
    operation: z.literal('retire'),
    artistId: artistIdSchema,
    pseudonymId: pseudonymIdSchema,
    reassignToPseudonymId: pseudonymIdSchema.optional()
  })
]).superRefine((mutation, context) => {
  if (
    mutation.operation === 'retire' &&
    mutation.reassignToPseudonymId === mutation.pseudonymId
  ) {
    context.addIssue({
      code: 'custom',
      path: ['reassignToPseudonymId'],
      message: 'La reasignación debe usar otro pseudónimo'
    })
  }
})

export type CreateArtistWithPseudonymsInput = z.infer<typeof createArtistWithPseudonymsSchema>
export type ArtistPseudonymMutationInput = z.infer<typeof artistPseudonymMutationSchema>
