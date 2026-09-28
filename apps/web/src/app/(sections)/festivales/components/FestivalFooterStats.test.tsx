import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

import { FestivalFooterStats } from './FestivalFooterStats'

afterEach(cleanup)

describe('FestivalFooterStats', () => {
  test('shows workshop and talk counts with distinct, appropriately labeled icons', () => {
    const { container } = render(
      <FestivalFooterStats talleresCount={3} charlasCount={2} musicaCount={0} />
    )

    expect(screen.getAllByText('Talleres')).toHaveLength(2)
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getAllByText('Charlas')).toHaveLength(2)
    expect(screen.getByText('2')).toBeTruthy()
    expect(container.querySelector('svg.lucide-paintbrush')).toBeTruthy()
    expect(container.querySelector('svg.lucide-mic')).toBeTruthy()
    expect(container.querySelector('svg.lucide-paintbrush')).not.toBe(
      container.querySelector('svg.lucide-mic')
    )
    expect(container.querySelector('svg.lucide-paintbrush')?.getAttribute('aria-hidden')).toBe(
      'true'
    )
    expect(container.querySelector('svg.lucide-mic')?.getAttribute('aria-hidden')).toBe(
      'true'
    )
  })

  test('hides activity stats when their counts are not positive', () => {
    render(<FestivalFooterStats talleresCount={0} charlasCount={0} musicaCount={0} />)

    expect(screen.queryByText('Talleres')).toBeNull()
    expect(screen.queryByText('Charlas')).toBeNull()
    expect(screen.queryByText('Bandas')).toBeNull()
  })
})
