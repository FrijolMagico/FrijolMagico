'use client'

import { useRef, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Label } from '@/components/ui/label'
import { TiptapToolbar } from './TiptapToolbar'
import type { OrganizacionFormData } from '../_types/organizacion'

import '@/styles/tiptap.css'

interface EditableRichTextFieldProps {
  label: string
  field: keyof Pick<OrganizacionFormData, 'descripcion' | 'mision' | 'vision'>
  value: string
  onChange: (field: keyof OrganizacionFormData, value: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export function EditableRichTextField({
  label,
  field,
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  disabled = false,
  minHeight = '200px'
}: EditableRichTextFieldProps) {
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
        onChange(field, newValue)
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
      <Label htmlFor={field}>{label}</Label>
      <div
        className={`rounded-md border ${disabled ? 'bg-gray-50' : 'bg-white'}`}
      >
        <TiptapToolbar editor={editor} disabled={disabled} />
        <EditorContent
          editor={editor}
          className='prose prose-sm max-w-none p-3 focus:outline-none'
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
