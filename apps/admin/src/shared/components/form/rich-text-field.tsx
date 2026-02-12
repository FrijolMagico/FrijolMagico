'use client'

import { useRef, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Label } from '@/shared/components/ui/label'
import { TiptapToolbar } from './tiptap-toolbar'

import '@/styles/tiptap.css'

interface RichTextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export function RichTextField({
  label,
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  disabled = false,
  minHeight = '200px'
}: RichTextFieldProps) {
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
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https'
      }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    editable: !disabled,
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

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
        <TiptapToolbar editor={editor} disabled={disabled} />
        <EditorContent
          editor={editor}
          className='dark:bg-input/30 placeholder:text-muted-foreground bg-transparent px-2.5 py-2 text-base transition-[color] outline-none disabled:opacity-50 md:text-sm'
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
