import { describe, expect, test } from 'bun:test'
import { Children, isValidElement } from 'react'

import NotFound from './not-found'

describe('NotFound', () => {
  test('renders the server-side marker used to hide global breadcrumbs', () => {
    const page = NotFound()
    const marker = Children.toArray(page.props.children).find(
      (child) =>
        isValidElement<{ 'data-not-found'?: boolean }>(child) &&
        child.props['data-not-found'] === true
    )

    expect(marker).toBeDefined()
  })
})
