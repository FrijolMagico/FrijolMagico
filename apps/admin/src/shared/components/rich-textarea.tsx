'use client'

import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import dynamic from 'next/dynamic'

import { Skeleton } from './ui/skeleton'

import TiptapLink from '@tiptap/extension-link'

interface RichTextareaProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  ref?: React.Ref<HTMLDivElement>
  placeholder?: string
  disabled?: boolean
}

export function RichTextareaUI({
  id,
  value,
  onChange,
  onBlur,
  ref,
  placeholder = 'Escribe aquí...',
  disabled = false
}: RichTextareaProps) {
  // Track last propagated value to avoid update loops
  const lastValueRef = useRef(value)
  // Track if we're updating from external value change
  const isExternalUpdateRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https'
      }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    editable: !disabled,
    onBlur: () => {
      onBlur?.()
    },
    onUpdate: ({ editor }) => {
      // Skip propagating if this update came from external value change
      if (isExternalUpdateRef.current) {
        isExternalUpdateRef.current = false
        return
      }

      const html = editor.getHTML()
      const newValue = html === '<p></p>' ? '' : html

      // Only propagate if value actually changed from last known
      if (newValue !== lastValueRef.current) {
        lastValueRef.current = newValue
        onChange(newValue)
      }
    },
    immediatelyRender: false
  })

  // Sync editor content when external value changes
  useEffect(() => {
    if (!editor) return

    const currentContent = editor.getHTML()
    const normalizedCurrent = currentContent === '<p></p>' ? '' : currentContent
    const normalizedValue = value || ''

    // Only update if the value is actually different
    if (
      normalizedValue !== normalizedCurrent &&
      normalizedValue !== lastValueRef.current
    ) {
      isExternalUpdateRef.current = true
      lastValueRef.current = normalizedValue

      // Use queueMicrotask to ensure DOM is ready
      queueMicrotask(() => {
        editor.commands.setContent(normalizedValue, { emitUpdate: false })
      })
    }
  }, [editor, value])

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <div
        ref={ref}
        className='border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 placeholder:text-muted-foreground field-sizing-content min-h-16 w-full overflow-clip rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm'
      >
        <TiptapToolbar editor={editor} disabled={disabled} />
        <EditorContent
          id={id}
          editor={editor}
          className='min-h-16 px-2.5 py-2 *:ring-0 *:outline-none *:focus:outline-none'
        />
      </div>
    </EditorContext.Provider>
  )
}

function RichTextareaSkeleton() {
  return (
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-12 w-full' />
      <Skeleton className='h-46 w-full' />
    </div>
  )
}

export const RichTextarea = dynamic(
  () => import('./rich-textarea').then((mod) => mod.RichTextareaUI),
  {
    ssr: false,
    loading: () => <RichTextareaSkeleton />
  }
)

import { useCallback, useState } from 'react'
import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Unlink,
  Undo,
  Redo
} from 'lucide-react'
import { Toggle } from '@/shared/components/ui/toggle'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'

interface TiptapToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

function TiptapToolbar({ editor, disabled = false }: TiptapToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
    }
    setLinkUrl('')
    setIsLinkDialogOpen(false)
  }, [editor, linkUrl])

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className='bg-muted flex flex-wrap items-center gap-1 p-2'>
        {/* History */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || disabled}
            className='h-8 w-8'
            title='Deshacer'
          >
            <Undo className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || disabled}
            className='h-8 w-8'
            title='Rehacer'
          >
            <Redo className='h-4 w-4' />
          </Button>
        </div>

        <Separator orientation='vertical' className='mx-1 h-6' />

        {/* Text formatting */}
        <div className='flex items-center gap-1'>
          <Toggle
            size='sm'
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            aria-label='Negrita'
            title='Negrita (Ctrl+B)'
          >
            <Bold className='h-4 w-4' />
          </Toggle>
          <Toggle
            size='sm'
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            aria-label='Cursiva'
            title='Cursiva (Ctrl+I)'
          >
            <Italic className='h-4 w-4' />
          </Toggle>
        </div>

        <Separator orientation='vertical' className='mx-1 h-6' />

        {/* Lists */}
        <div className='flex items-center gap-1'>
          <Toggle
            size='sm'
            pressed={editor.isActive('bulletList')}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            disabled={disabled}
            aria-label='Lista con viñetas'
            title='Lista con viñetas'
          >
            <List className='h-4 w-4' />
          </Toggle>
          <Toggle
            size='sm'
            pressed={editor.isActive('orderedList')}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            disabled={disabled}
            aria-label='Lista numerada'
            title='Lista numerada'
          >
            <ListOrdered className='h-4 w-4' />
          </Toggle>
        </div>

        <Separator orientation='vertical' className='mx-1 h-6' />

        {/* Link */}
        <div className='flex items-center gap-1'>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger
              render={
                <Toggle
                  size='sm'
                  pressed={editor.isActive('link')}
                  disabled={disabled}
                  aria-label='Insertar enlace'
                  title='Insertar enlace'
                />
              }
            >
              <Link className='h-4 w-4' />
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Insertar enlace</DialogTitle>
                <DialogDescription>
                  Ingresa la URL del enlace que quieres agregar.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='url'>URL</Label>
                  <Input
                    id='url'
                    placeholder='https://ejemplo.com'
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLink()
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsLinkDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={setLink}>Agregar enlace</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {editor.isActive('link') && (
            <Button
              variant='ghost'
              size='icon'
              onClick={unsetLink}
              disabled={disabled}
              className='h-8 w-8'
              title='Quitar enlace'
            >
              <Unlink className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </>
  )
}
