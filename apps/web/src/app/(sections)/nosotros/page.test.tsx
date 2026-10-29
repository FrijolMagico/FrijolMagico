import { expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('./lib/getAboutData', () => ({
  getAboutData: async () => ({
    data: { mision: 'Nuestra misión', vision: 'Nuestra visión' },
    error: null
  })
}))

test('keeps the about content and adds a direct transparency link at the end', async () => {
  const { default: AboutPage } = await import('./page')
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(await AboutPage())
  const main = container.querySelector('main')
  expect(main?.textContent).toContain('Nuestra misión')
  expect(main?.textContent).toContain('Nuestra visión')
  const link = main?.lastElementChild?.querySelector('a')
  expect(link?.textContent).toContain('Transparencia')
  expect(link?.getAttribute('href')).toBe('/transparencia')
})

test('uses the centered offset variant for the transparency button', async () => {
  const { default: AboutPage } = await import('./page')
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(await AboutPage())
  const wrapper = container.querySelector('main')?.lastElementChild
  const link = wrapper?.querySelector('a')
  expect(wrapper?.classList.contains('text-center')).toBe(true)
  expect(link?.classList.contains('group/btn')).toBe(true)
  expect(link?.classList.contains('inline-flex')).toBe(true)
  expect(
    link
      ?.querySelector('span[aria-hidden="true"]')
      ?.classList.contains('translate-1')
  ).toBe(true)
})

test('separates the team image and transparency button with a decorative doodle', async () => {
  const { default: AboutPage } = await import('./page')
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(await AboutPage())
  const wrapper = container.querySelector('main')?.lastElementChild
  expect(
    wrapper?.previousElementSibling?.querySelector(
      'img[alt="Equipo de Frijol Mágico frente a mural del festival"]'
    )
  ).not.toBeNull()
  const doodle = wrapper?.querySelector('div[aria-hidden="true"]')
  expect(doodle?.querySelector('svg path')).not.toBeNull()
  expect(doodle?.nextElementSibling?.getAttribute('href')).toBe(
    '/transparencia'
  )
})
