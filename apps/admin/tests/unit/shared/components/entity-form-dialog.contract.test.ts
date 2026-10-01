import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

// These are structural contracts; computed layout still needs a browser check.
const dialog = readFileSync(
  new URL('../../../../src/shared/components/entity-form/entity-form-dialog.tsx', import.meta.url),
  'utf8'
)
const activityForms = [
  { name: 'create-activity-dialog.tsx', width: 'md:w-6xl' },
  { name: 'update-activity-dialog.tsx', width: 'md:w-7xl' }
].map(({ name, width }) => ({
  source: readFileSync(
    new URL(
      `../../../../src/app/(core)/eventos/participaciones/_components/${name}`,
      import.meta.url
    ),
    'utf8'
  ),
  width
}))

describe('EntityFormDialog layout contract', () => {
  test('caps panel height and width while scrolling only the body', () => {
    expect(dialog).toContain('max-h-[calc(100dvh-2rem)]')
    expect(dialog).toContain("maxWidth: 'calc(100vw - 2rem)'")
    expect(dialog).toMatch(/<DialogHeader className='[^']*border-b[^']*'/)
    expect(dialog).toMatch(/<div className='[^']*min-h-0[^']*overflow-y-auto[^']*'>\{children\}<\/div>/)
    expect(dialog).toMatch(/<DialogFooter[\s\S]*?border-t/)
    expect(dialog).not.toContain('md:max-w-6xl')
  })

  test('preserves primitive width defaults except for opted-in activity forms', () => {
    expect(dialog).toContain('contentSized?: boolean')
    expect(dialog).toMatch(/contentSized && 'w-fit sm:max-w-none'/)
    expect(dialog).not.toMatch(/'flex w-fit[^']*sm:max-w-none'/)
    for (const { source } of activityForms) {
      expect(source).toMatch(/<EntityFormDialog[\s\S]*?contentSized/)
    }
  })

  test('constrains activity forms and stacks columns on narrow devices', () => {
    for (const { source, width } of activityForms) {
      expect(source).not.toMatch(/className\s*=\s*['\"]md:max-w-6xl md:min-w-3xl['\"]/)
      expect(source).toMatch(
        new RegExp(`<form[\\s\\S]*?className\\s*=\\s*(['\"])[^'\"]*max-w-full[^'\"]*flex-col[^'\"]*${width}[^'\"]*md:flex-row\\1`)
      )
      expect(source.match(/className\s*=\s*(['\"])(?=[^'"]*hidden)(?=[^'"]*md:block)[^'"]*['"]/g)?.length).toBe(2)
    }
  })
})
