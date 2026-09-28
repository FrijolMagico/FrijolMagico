'use client'

import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/shared/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import { getArtistPseudonymsAction } from '../_actions/update-artista.action'
import {
  addNewArtistPseudonym,
  createNewArtistPseudonymState,
  getArtistPseudonymCheckboxState,
  makeNewArtistPseudonymPrimary,
  preserveHistoryForPseudonymText,
  persistablePseudonymDrafts,
  updateNewArtistPseudonym,
  upsertPseudonymDraft,
  type ArtistPseudonymDraftInput,
  type ArtistPseudonymDraftState,
  type ArtistPseudonymEditorDraft,
  type NewArtistPseudonymState
} from '../_schemas/artist-pseudonym.schema'
import type {
  ArtistCreateFormInput,
  ArtistUpdateFormInput
} from '../_schemas/artista.schema'


interface ArtistPseudonymEditorProps {
  artistId: number
  initialPseudonym: string
  onDraftsChange: (drafts: ArtistPseudonymDraftInput[]) => void
}

export function ArtistPseudonymEditor({
  artistId,
  initialPseudonym,
  onDraftsChange
}: ArtistPseudonymEditorProps) {
  const { control } = useFormContext<ArtistUpdateFormInput>()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<
    { id: number; pseudonimo: string; isPrimary: boolean }[]
  >([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [drafts, setDrafts] = useState<ArtistPseudonymDraftState>({})

  const selected = options.find((option) => option.id === selectedId)
  const currentKey = adding ? 'new' : selectedId === null ? 'primary' : String(selectedId)
  const storedDraft = drafts[currentKey]
  const originalText = adding
    ? ''
    : selected?.pseudonimo ?? storedDraft?.originalText ?? initialPseudonym
  const currentText = storedDraft?.pseudonym ?? originalText
  const checkboxState = getArtistPseudonymCheckboxState({
    adding,
    selectedId,
    options,
    drafts,
    currentText,
    originalText
  })
  const preserveHistory = checkboxState.preserveHistory
  const makePrimary = storedDraft?.makePrimary ?? false

  const publish = (nextDrafts: ArtistPseudonymDraftState) => {
    setDrafts(nextDrafts)
    onDraftsChange(persistablePseudonymDrafts(nextDrafts))
  }

  const saveCurrent = (
    pseudonym: string,
    changes: { preserveHistory?: boolean; makePrimary?: boolean } = {}
  ) => {
    const draft: ArtistPseudonymEditorDraft = adding
      ? {
          operation: 'add',
          pseudonym,
          makePrimary: makePrimary,
          originalText: '',
          ...changes
        } as ArtistPseudonymEditorDraft
      : {
          operation: 'edit',
          pseudonymId: selectedId,
          pseudonym,
          makePrimary,
          originalText,
          ...changes,
          preserveHistory: preserveHistoryForPseudonymText(
            pseudonym,
            originalText,
            changes.preserveHistory ?? preserveHistory
          )
        } as ArtistPseudonymEditorDraft
    const nextDrafts: ArtistPseudonymDraftState = changes.makePrimary === true
      ? Object.fromEntries(Object.entries(drafts).map(([key, current]) => [
          key,
          { ...current, makePrimary: false }
        ]))
      : drafts
    publish(upsertPseudonymDraft(nextDrafts, currentKey, draft))
  }

  const loadOptions = async () => {
    if (options.length || loading) return
    setLoading(true)
    try {
      setOptions(await getArtistPseudonymsAction(artistId))
    } finally {
      setLoading(false)
    }
  }

  const selectOption = (id: number) => {
    const option = options.find((candidate) => candidate.id === id)
    if (!option) return
    setSelectedId(id)
    setAdding(false)
    setOpen(false)
  }

  return (
    <Field>
      <div className='flex items-center justify-between'>
        <FieldLabel htmlFor='pseudonimo'>Pseudónimo *</FieldLabel>
        <span className='text-muted-foreground text-xs'>
          {selected?.isPrimary || (!adding && selectedId === null)
            ? 'Principal'
            : selected ? 'Secundario' : ''}
        </span>
      </div>
      <InputGroup>
        <Controller
          name='pseudonimo'
          control={control}
          render={({ field }) => (
            <InputGroupInput
              id='pseudonimo'
              placeholder='Pseudónimo artístico'
              value={adding ? currentText : currentText || field.value}
              onChange={(event) => {
                const pseudonym = event.target.value
                field.onChange(pseudonym)
                saveCurrent(pseudonym)
              }}
              aria-label='Pseudónimo artístico'
            />
          )}
        />
        <InputGroupAddon align='inline-end' className='p-0 pr-1'>
          <Popover
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen)
              if (nextOpen) void loadOptions()
            }}
          >
            <PopoverTrigger
              render={<Button type='button' variant='ghost' size='icon-xs' aria-label='Elegir pseudónimo' />}
            >
              <IconChevronDown />
            </PopoverTrigger>
            <PopoverContent align='end' className='w-64 gap-1 p-1'>
              {loading ? <p className='p-2 text-muted-foreground'>Cargando...</p> : null}
              {options.map((option) => (
                <Button
                  key={option.id}
                  type='button'
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => selectOption(option.id)}
                >
                  {option.pseudonimo}{option.isPrimary ? ' · Principal' : ''}
                </Button>
              ))}
              <Button
                type='button'
                variant='ghost'
                className='w-full justify-start border-t'
                onClick={() => {
                  setAdding(true)
                  setSelectedId(null)
                  setOpen(false)
                }}
              >
                Añadir pseudónimo
              </Button>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      <label className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={preserveHistory}
          disabled={checkboxState.historyDisabled}
          onCheckedChange={(value) => saveCurrent(currentText, { preserveHistory: value === true })}
        />
        Guardar el nombre anterior en el historial
      </label>
      <label className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={checkboxState.makePrimary}
          disabled={checkboxState.primaryDisabled}
          onCheckedChange={(value) => saveCurrent(currentText, { makePrimary: value === true })}
        />
        Usar como pseudónimo principal
      </label>
    </Field>
  )
}

interface CreateArtistPseudonymEditorProps {
  onChange: (value: { pseudonyms: string[]; primaryPseudonym: string }) => void
}

export function CreateArtistPseudonymEditor({
  onChange
}: CreateArtistPseudonymEditorProps) {
  const { control, setValue, formState: { errors } } = useFormContext<ArtistCreateFormInput>()
  const [state, setState] = useState<NewArtistPseudonymState>(createNewArtistPseudonymState)
  const [selectedId, setSelectedId] = useState(0)
  const [open, setOpen] = useState(false)
  const selected = state.drafts.find((draft) => draft.id === selectedId) ?? state.drafts[0]
  const primary = state.drafts.find((draft) => draft.id === state.primaryId)
  const publish = (next: NewArtistPseudonymState) => {
    setState(next)
    const primaryPseudonym = next.drafts.find((draft) => draft.id === next.primaryId)?.pseudonym ?? ''
    setValue('pseudonimo', primaryPseudonym, { shouldDirty: true, shouldValidate: true })
    onChange({
      pseudonyms: next.drafts.map((draft) => draft.pseudonym),
      primaryPseudonym
    })
  }

  return (
    <Field>
      <div className='flex items-center justify-between'>
        <FieldLabel htmlFor='pseudonimo'>Pseudónimo <span className='text-destructive'>*</span></FieldLabel>
        <span className='text-muted-foreground text-xs'>
          {selected?.id === state.primaryId ? 'Principal' : 'Secundario'}
        </span>
      </div>
      <InputGroup>
        <Controller
          name='pseudonimo'
          control={control}
          render={() => (
            <InputGroupInput
              id='pseudonimo'
              placeholder='Pseudónimo artístico'
              value={selected?.pseudonym ?? ''}
              onChange={(event) => {
                const next = updateNewArtistPseudonym(state, selectedId, event.target.value)
                publish(next)
              }}
              aria-label='Pseudónimo artístico'
              aria-invalid={!!errors.pseudonimo}
            />
          )}
        />
        <InputGroupAddon align='inline-end' className='p-0 pr-1'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button type='button' variant='ghost' size='icon-xs' aria-label='Elegir pseudónimo' />}
            >
              <IconChevronDown />
            </PopoverTrigger>
            <PopoverContent align='end' className='w-64 gap-1 p-1'>
              {state.drafts.map((draft) => (
                <Button
                  key={draft.id}
                  type='button'
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => {
                    setSelectedId(draft.id)
                    setOpen(false)
                  }}
                >
                  {draft.pseudonym || 'Nuevo pseudónimo'}{draft.id === state.primaryId ? ' · Principal' : ''}
                </Button>
              ))}
              <Button
                type='button'
                variant='ghost'
                className='w-full justify-start border-t'
                onClick={() => {
                  const next = addNewArtistPseudonym(state)
                  const added = next.drafts[next.drafts.length - 1]
                  setSelectedId(added.id)
                  publish(next)
                  setOpen(false)
                }}
              >
                Añadir pseudónimo
              </Button>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {errors.pseudonimo && <FieldError>{errors.pseudonimo.message}</FieldError>}
      <label className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={selected?.id === state.primaryId}
          disabled={selected?.id === state.primaryId}
          onCheckedChange={() => {
            const next = makeNewArtistPseudonymPrimary(state, selectedId)
            publish(next)
          }}
        />
        Usar como pseudónimo principal
      </label>
      <span className='sr-only' aria-live='polite'>Pseudónimo principal: {primary?.pseudonym ?? ''}</span>
    </Field>
  )
}
