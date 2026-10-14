import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
let pathname: string | null = '/'

mock.module('next/navigation', () => ({
  usePathname: () => pathname
}))

afterEach(cleanup)

describe('TopBarRouteGate', () => {
  test('hides its content on the exact homepage route', async () => {
    pathname = '/'
    const { TopBarRouteGate } = await import('./top-bar-route-gate')

    render(
      <TopBarRouteGate>
        <div>Info bar</div>
      </TopBarRouteGate>
    )

    expect(screen.queryByText('Info bar')).toBeNull()
  })

  test.each(['/catalogo', '/festivales', '/festivales/edicion-xv'])(
    'renders its content on %s',
    async (route) => {
      pathname = route
      const { TopBarRouteGate } = await import('./top-bar-route-gate')

      render(
        <TopBarRouteGate>
          <div>Info bar</div>
        </TopBarRouteGate>
      )

      expect(screen.getByText('Info bar')).toBeDefined()
    }
  )

  test('preserves existing rendering when the pathname is null', async () => {
    pathname = null
    const { TopBarRouteGate } = await import('./top-bar-route-gate')

    render(
      <TopBarRouteGate>
        <div>Info bar</div>
      </TopBarRouteGate>
    )

    expect(screen.getByText('Info bar')).toBeDefined()
  })

  test('updates visibility when client navigation changes the pathname', async () => {
    pathname = '/'
    const { TopBarRouteGate } = await import('./top-bar-route-gate')
    const children = (content: string) => <div>{content}</div>
    const { rerender } = render(
      <TopBarRouteGate>{children('Info bar')}</TopBarRouteGate>
    )

    expect(screen.queryByText('Info bar')).toBeNull()

    pathname = '/catalogo'
    rerender(<TopBarRouteGate>{children('Info bar')}</TopBarRouteGate>)

    expect(screen.getByText('Info bar')).toBeDefined()

    pathname = '/'
    rerender(<TopBarRouteGate>{children('Info bar')}</TopBarRouteGate>)

    expect(screen.queryByText('Info bar')).toBeNull()
  })
})
