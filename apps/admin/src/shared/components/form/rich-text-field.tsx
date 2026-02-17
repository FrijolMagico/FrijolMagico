'use client'

import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { TiptapToolbar } from './tiptap-toolbar'

import '@/styles/tiptap.css'
import Link from '@tiptap/extension-link'

interface RichTextFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  ref?: React.Ref<HTMLDivElement>
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export function RichTextField({
  id,
  value,
  onChange,
  onBlur,
  ref,
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
    onBlur: ({ editor }) => {
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
      <div ref={ref}>
        <TiptapToolbar editor={editor} disabled={disabled} />
        <EditorContent
          id={id}
          editor={editor}
          className='dark:bg-input/30 placeholder:text-muted-foreground bg-transparent px-2.5 py-2 text-base transition-[color] outline-none disabled:opacity-50 md:text-sm'
          style={{ minHeight }}
        />
      </div>
    </EditorContext.Provider>
  )
}
