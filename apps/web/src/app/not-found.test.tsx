import { describe, expect, test } from 'bun:test'
import { Children, isValidElement } from 'react'

import { ContextBar } from '@/components/context-bar/ContextBar'

import NotFound from './not-found'

describe('NotFound', () => {
  test('composes the ContextBar in minimal mode', () => {
    const page = NotFound()
    const contextBar = Children.toArray(page.props.children).find(
      (child) => isValidElement(child) && child.type === ContextBar
    )

    expect(isValidElement<{ mode?: string }>(contextBar)).toBe(true)
    if (!isValidElement<{ mode?: string }>(contextBar)) return

    expect(contextBar.props.mode).toBe('minimal')
  })
})
