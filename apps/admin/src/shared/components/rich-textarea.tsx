'use client'

import { useEffect, useRef } from 'react'
import { Tiptap, useEditor, useEditorState, useTiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

import { useCallback, useState } from 'react'
import { type Editor } from '@tiptap/react'
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
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconLink,
  IconListFilled,
  IconListNumbers,
  IconUnlink
} from '@tabler/icons-react'

import { Skeleton } from './ui/skeleton'

import TiptapLink from '@tiptap/extension-link'

interface RichTextareaProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextarea({
  id,
  value,
  onChange,
  placeholder = 'Escribe aquí...'
}: RichTextareaProps) {
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
    editorProps: {
      attributes: {
        class: 'min-h-16'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    content: value || '',
    immediatelyRender: false
  })

  if (!editor) return <RichTextareaSkeleton />

  return (
    <Tiptap editor={editor}>
      <div className='border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 placeholder:text-muted-foreground field-sizing-content min-h-16 w-full overflow-clip rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm'>
        <TiptapToolbar />
        <Tiptap.Content
          id={id}
          className='px-2.5 py-2 *:ring-0 *:outline-none *:focus:outline-none'
        />
      </div>
    </Tiptap>
  )
}

function RichTextareaSkeleton() {
  return (
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-12 w-full' />
      <Skeleton className='h-20 w-full' />
    </div>
  )
}

function TiptapToolbar() {
  const { editor } = useTiptap()

  const { canUndo, canRedo } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo()
    })
  })
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
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!canUndo}
            className='cursor-pointer'
            title='Deshacer'
          >
            <IconArrowBackUp />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!canRedo}
            className='cursor-pointer'
            title='Rehacer'
          >
            <IconArrowForwardUp />
          </Button>
        </div>

        <Separator orientation='vertical' />

        {/* Text formatting */}
        <div className='flex items-center gap-1'>
          <Toggle
            size='sm'
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label='Negrita'
            title='Negrita (Ctrl+B)'
            className='cursor-pointer'
          >
            <IconBold />
          </Toggle>
          <Toggle
            size='sm'
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label='Cursiva'
            title='Cursiva (Ctrl+I)'
            className='cursor-pointer'
          >
            <IconItalic />
          </Toggle>
        </div>

        <Separator orientation='vertical' />

        {/* Lists */}
        <div className='flex items-center gap-1'>
          <Toggle
            size='sm'
            pressed={editor.isActive('bulletList')}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            aria-label='Lista con viñetas'
            title='Lista con viñetas'
            className='cursor-pointer'
          >
            <IconListFilled />
          </Toggle>
          <Toggle
            size='sm'
            pressed={editor.isActive('orderedList')}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            aria-label='Lista numerada'
            title='Lista numerada'
            className='cursor-pointer'
          >
            <IconListNumbers />
          </Toggle>
        </div>

        <Separator orientation='vertical' />

        {/* Link */}
        <div className='flex items-center gap-1'>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Toggle
                size='sm'
                pressed={editor.isActive('link')}
                aria-label='Insertar enlace'
                title='Insertar enlace'
                className='cursor-pointer'
              >
                <IconLink />
              </Toggle>
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
              className='cursor-pointer'
              title='Quitar enlace'
            >
              <IconUnlink />
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </>
  )
}
