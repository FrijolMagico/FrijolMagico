'use client'

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
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface TiptapToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

export function TiptapToolbar({
  editor,
  disabled = false
}: TiptapToolbarProps) {
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
    <div className='flex flex-wrap items-center gap-1 border-b bg-gray-50/50 p-2'>
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
          <DialogTrigger asChild>
            <Toggle
              size='sm'
              pressed={editor.isActive('link')}
              disabled={disabled}
              aria-label='Insertar enlace'
              title='Insertar enlace'
            >
              <Link className='h-4 w-4' />
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
            disabled={disabled}
            className='h-8 w-8'
            title='Quitar enlace'
          >
            <Unlink className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}
