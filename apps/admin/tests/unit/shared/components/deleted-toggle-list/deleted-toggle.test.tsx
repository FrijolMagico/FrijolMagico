import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { DeletedToggle } from '@/shared/components/deleted-toggle-list'

describe('DeletedToggle', () => {
  test('hides the badge when there are no deleted items', () => {
    const markup = renderToStaticMarkup(
      <DeletedToggle showDeleted={false} onToggle={() => {}} deletedCount={0} />
    )

    expect(markup).toContain('Mostrar eliminados')
    expect(markup).toContain('aria-pressed="false"')
    expect(markup).not.toContain('>0<')
  })

  test('shows deleted label, aria-pressed state, and badge count', () => {
    const markup = renderToStaticMarkup(
      <DeletedToggle showDeleted onToggle={() => {}} deletedCount={4} />
    )

    expect(markup).toContain('Ocultar eliminados')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('>4<')
  })
})
