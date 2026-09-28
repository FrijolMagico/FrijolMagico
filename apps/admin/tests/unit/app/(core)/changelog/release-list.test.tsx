import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { ReleaseList } from '@/app/(core)/changelog/_components/release-list'
import type { GithubRelease } from '@/app/(core)/changelog/_lib/data-access-layer/get-github-releases'

const releases: GithubRelease[] = [
  { id: 1, name: 'Latest', tagName: 'v2', publishedAt: '2024-02-01T00:00:00Z', body: '## New\n\n- change' },
  { id: 2, name: 'Previous', tagName: 'v1', publishedAt: '2024-01-01T00:00:00Z', body: 'Previous notes' }
]

describe('ReleaseList', () => {
  test('expands only the newest release and renders older releases collapsed', () => {
    const markup = renderToStaticMarkup(<ReleaseList releases={releases} />)
    const expandedTrigger = markup.match(/<button[^>]*aria-expanded="true"[^>]*>/g) ?? []
    const collapsedTrigger = markup.match(/<button[^>]*aria-expanded="false"[^>]*>/g) ?? []

    expect(expandedTrigger).toHaveLength(1)
    expect(collapsedTrigger).toHaveLength(1)
    expect(markup.indexOf('Latest')).toBeLessThan(markup.indexOf('Previous'))
  })

  test('renders Markdown formatting but not embedded raw HTML', () => {
    const markup = renderToStaticMarkup(
      <ReleaseList releases={[{ ...releases[0], body: '<script>alert(1)</script>\n\n**Safe**' }]} />
    )

    expect(markup).not.toContain('<script>')
    expect(markup).toContain('<strong>Safe</strong>')
  })

  test('renders no notice or entries when there are no releases', () => {
    const markup = renderToStaticMarkup(<ReleaseList releases={[]} />)

    expect(markup).not.toContain('No releases')
    expect(markup).not.toContain('Latest')
  })
})
