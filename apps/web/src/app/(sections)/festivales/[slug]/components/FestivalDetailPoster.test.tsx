import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

import { FestivalDetailPoster } from './FestivalDetailPoster'

afterEach(cleanup)

describe('FestivalDetailPoster', () => {
  test('renders image when poster URL is provided', () => {
    render(
      <FestivalDetailPoster
        posterUrl='https://cdn.frijolmagico.cl/poster.webp'
        eventName='Festival Frijol Mágico'
        editionName='Edición XV'
        priority
      />
    )

    const image = screen.getByAltText('Afiche Festival Frijol Mágico Edición XV')
    expect(image).toBeDefined()
  })

  test('renders gradient fallback with event name when no poster URL', () => {
    render(
      <FestivalDetailPoster
        posterUrl={null}
        eventName='Festival Frijol Mágico'
        editionName='XV'
        priority={false}
      />
    )

    expect(
      screen.getByText('Festival Frijol Mágico')
    ).toBeDefined()
    expect(screen.queryByRole('img')).toBeNull()
  })
})
