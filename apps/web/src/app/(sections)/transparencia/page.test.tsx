import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

async function renderPage() {
  const { default: TransparencyPage } = await import('./page')
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(<TransparencyPage />)
  return container
}

describe('transparency page', () => {
  test('renders the four columns and all six projects with their exact funding and agreements', async () => {
    const container = await renderPage()
    expect(
      Array.from(
        container.querySelectorAll('thead th'),
        (cell) => cell.textContent
      )
    ).toEqual([
      'Nombre del Proyecto',
      'Línea de financiamiento',
      'Monto',
      'Link del convenio'
    ])

    const expected = [
      [
        'Aves Migratorias en la región de Coquimbo',
        'GORE Cultura Regional 2023',
        '$7,247,660.00',
        'https://drive.google.com/file/d/11hyl6UBukbKQyOgPafilA244d0PsswSU/view?usp=sharing'
      ],
      [
        'Festival Frijol Magico 2024',
        'Economias Creativas 2023',
        '$22,996,250.00',
        'https://drive.google.com/file/d/1U5FhezICk3DNHv1ucN0WuIodpGSMmCto/view?usp=sharing'
      ],
      [
        'Festival Frijol Magico "Un nuevo germinar"',
        'FONDART regional linea festivales 2024',
        '$26,828,894.00',
        'https://drive.google.com/file/d/19nlyDld_o_Q8v5hbXzqCLiZtit8na9WQ/view?usp=sharing'
      ],
      [
        'Novela Grafica Los Perdedores',
        'GORE Cultura Regional 2024',
        '$9,118,569.00',
        'https://drive.google.com/file/d/1t7tAvAI8YGxtDmPd8UD-6JEy6fMfKjzm/view?usp=sharing'
      ],
      [
        'Festival Frijol Mágico 2025',
        'FONDART regional linea festival trayectoria 2025',
        '$29,625,740.00',
        'https://drive.google.com/file/d/1Rz3gG4PbYf-BhFvpn_IKxU5B_U7_VcLe/view?usp=sharing'
      ],
      [
        'Festival Frijol Magico 2026',
        'Glosa 07 convocatoria 2025',
        '$76,938,750.00',
        'https://drive.google.com/file/d/1Jq84uc7ro_XXSmYpn99Rb2s-RkxiQPPf/view?usp=sharing'
      ]
    ]
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(expected.length)
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('th, td')
      expect(cells).toHaveLength(4)
      expect(
        Array.from(cells)
          .slice(0, 3)
          .map((cell) => cell.textContent)
      ).toEqual(expected[index]!.slice(0, 3))
      const link = cells[3]!.querySelector('a')
      expect(link?.getAttribute('href')).toBe(expected[index]![3])
      expect(link?.getAttribute('target')).toBe('_blank')
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
      expect(link?.getAttribute('aria-label')).toContain(expected[index]![0])
    })
  })

  test('reuses the footer wavy underline for every agreement link', async () => {
    const container = await renderPage()
    const links = container.querySelectorAll('tbody td:last-child a')
    expect(links).toHaveLength(6)
    for (const link of links) {
      expect(link.classList.contains('wavy-underline')).toBe(true)
    }
  })

  test('links all four festival projects with the existing rotating-arrow link', async () => {
    const container = await renderPage()
    for (const [name, href] of [
      ['Festival Frijol Magico 2024', '/festivales/frijol-magico-xiii'],
      [
        'Festival Frijol Magico "Un nuevo germinar"',
        '/festivales/frijol-magico-xiv'
      ],
      ['Festival Frijol Mágico 2025', '/festivales/frijol-magico-xv'],
      ['Festival Frijol Magico 2026', '/festivales/frijol-magico-xvi']
    ] as const) {
      const link = Array.from(container.querySelectorAll('tbody th a')).find(
        (anchor) => anchor.textContent === name
      )
      expect(link?.getAttribute('href')).toBe(href)
      expect(link?.querySelector('svg')?.getAttribute('class')).toContain(
        'group-hover:-rotate-45'
      )
    }
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0]?.querySelector('th a')).toBeNull()
    expect(rows[3]?.querySelector('th a')).toBeNull()
  })

  test('keeps project names and arrows on one line inside the table scroll region', async () => {
    const container = await renderPage()
    expect(container.querySelector('main')?.classList.contains('min-w-0')).toBe(
      true
    )
    const region = container.querySelector('[role="region"]')
    for (const className of [
      'w-full',
      'min-w-0',
      'max-w-full',
      'overflow-x-auto'
    ]) {
      expect(region?.classList.contains(className)).toBe(true)
    }
    const names = container.querySelectorAll('tbody th[scope="row"]')
    expect(names).toHaveLength(6)
    for (const name of names) {
      expect(name.classList.contains('whitespace-nowrap')).toBe(true)
      const link = name.querySelector('a')
      if (link) {
        for (const className of [
          'w-max',
          'shrink-0',
          'gap-2',
          'hover:text-accent',
          'motion-reduce:transition-none',
          '[&>svg]:static',
          '[&>svg]:shrink-0',
          '[&>svg]:group-focus-visible:-rotate-45',
          '[&>svg]:motion-reduce:transition-none'
        ]) {
          expect(link.classList.contains(className)).toBe(true)
        }
        expect(link.classList.contains('hover:text-shadow')).toBe(false)
        expect(link.classList.contains('max-w-full')).toBe(false)
        expect(link.querySelector('.min-w-0')).toBeNull()
      }
    }
    for (const cell of container.querySelectorAll('tbody td:nth-child(2)')) {
      expect(cell.classList.contains('break-words')).toBe(true)
      expect(cell.classList.contains('min-w-64')).toBe(true)
      expect(cell.classList.contains('whitespace-nowrap')).toBe(false)
    }
  })

  test('gives agreement links text-only brand-colored hover and keyboard-focus states', async () => {
    const container = await renderPage()
    const links = container.querySelectorAll('tbody td:last-child a')
    expect(links).toHaveLength(6)
    for (const link of links) {
      for (const className of [
        'wavy-underline',
        'inline-block',
        'text-primary',
        'hover:text-accent',
        'focus-visible:text-accent',
        'focus-visible:outline-primary',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-4',
        'motion-reduce:transition-none'
      ]) {
        expect(link.classList.contains(className)).toBe(true)
      }
      expect(link.classList.contains('whitespace-nowrap')).toBe(false)
      expect(
        Array.from(link.classList).some((className) =>
          /^(hover:|focus-visible:)?(bg-|px-|py-)/.test(className)
        )
      ).toBe(false)
    }
  })

  test('shows a description below the page title', async () => {
    const container = await renderPage()
    expect(container.querySelector('header p')?.textContent).toBe(
      'Conoce los proyectos que hemos realizado, sus fuentes de financiamiento y los convenios que los respaldan. Revisa también el informe de impacto del Festival Frijol Mágico 2026.'
    )
  })

  test('uses the catalog dashed outline and the site palette for the table', async () => {
    const container = await renderPage()
    const region = container.querySelector(
      '[aria-label="Proyectos y financiamiento"]'
    )
    expect(region?.getAttribute('role')).toBe('region')
    expect(region?.getAttribute('tabindex')).toBe('0')
    expect(region?.classList.contains('overflow-x-auto')).toBe(true)
    expect(region?.classList.contains('rounded-3xl')).toBe(true)
    expect(region?.classList.contains('outline-1')).toBe(true)
    expect(region?.classList.contains('outline-dashed')).toBe(true)
    expect(region?.classList.contains('outline-primary/50')).toBe(true)
    expect(region?.classList.contains('bg-background')).toBe(true)
    expect(
      container.querySelector('thead')?.classList.contains('bg-primary')
    ).toBe(true)
    expect(
      container.querySelector('thead')?.classList.contains('text-background')
    ).toBe(true)
  })

  test('places the impact report after the table with one valid URL', async () => {
    const container = await renderPage()
    const section = container.querySelector(
      'section[aria-labelledby="impact-report-title"]'
    )
    expect(section?.querySelector('h2')?.textContent).toBe(
      'Informe de Impacto - Festival Frijol Mágico 2026'
    )
    expect(section?.querySelector('a')?.textContent).toBe('Ver aquí')
    expect(section?.classList.contains('text-center')).toBe(true)
    const button = section?.querySelector('a')
    expect(button?.classList.contains('group/btn')).toBe(true)
    expect(button?.classList.contains('inline-flex')).toBe(true)
    expect(
      button
        ?.querySelector('span[aria-hidden="true"]')
        ?.classList.contains('translate-1')
    ).toBe(true)
    expect(button?.getAttribute('target')).toBe('_blank')
    expect(button?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(section?.querySelector('a')?.getAttribute('href')).toBe(
      'https://drive.google.com/file/d/1rsLE-HjOB-ouF9riljWYCZskKPLsg6Zi/view'
    )
    const main = container.querySelector('main')
    expect(main?.lastElementChild).toBe(section)
    expect(main?.querySelector('table')).not.toBeNull()
  })
})
