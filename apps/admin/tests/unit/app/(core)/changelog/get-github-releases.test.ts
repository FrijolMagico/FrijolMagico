import { afterEach, describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const { getGithubReleases } =
  await import('@/app/(core)/changelog/_lib/data-access-layer/get-github-releases')

const originalFetch = globalThis.fetch

function setFetch(implementation: (input: RequestInfo | URL) => Promise<Response>) {
  globalThis.fetch = Object.assign(implementation, {
    preconnect: originalFetch.preconnect
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('getGithubReleases', () => {
  test('fetches every page, normalizes results, and returns newest first', async () => {
    const requests: string[] = []
    setFetch(async (input) => {
      const url = new URL(String(input))
      requests.push(url.toString())
      const page = Number(url.searchParams.get('page'))
      const releases =
        page === 1
          ? [
              {
                id: 1,
                name: 'Older',
                tag_name: 'v1',
                published_at: '2024-01-01T00:00:00Z',
                body: 'old'
              }
            ]
          : page === 2
            ? [
                {
                  id: 2,
                  name: 'Newer',
                  tag_name: 'v2',
                  published_at: '2024-02-01T00:00:00Z',
                  body: 'new'
                }
              ]
            : []

      return new Response(JSON.stringify(releases), { status: 200 })
    })

    const releases = await getGithubReleases()

    expect(requests).toHaveLength(3)
    expect(releases.map(({ name }) => name)).toEqual(['Newer', 'Older'])
    expect(releases[0]).toEqual({
      id: 2,
      name: 'Newer',
      tagName: 'v2',
      publishedAt: '2024-02-01T00:00:00Z',
      body: 'new'
    })
  })

  test('returns no entries when a request or response is unusable', async () => {
    setFetch(async () => {
      throw new Error('network unavailable')
    })
    await expect(getGithubReleases()).resolves.toEqual([])

    setFetch(async () => new Response('unavailable', { status: 503 }))
    await expect(getGithubReleases()).resolves.toEqual([])

    setFetch(async () => new Response('not json', { status: 200 }))
    await expect(getGithubReleases()).resolves.toEqual([])

    setFetch(async () =>
      new Response(JSON.stringify([{ id: 'invalid' }]), { status: 200 })
    )
    await expect(getGithubReleases()).resolves.toEqual([])

    setFetch(async (input) => {
      const page = new URL(String(input)).searchParams.get('page')
      return page === '1'
        ? new Response(
            JSON.stringify([
              {
                id: 1,
                name: 'Release',
                tag_name: 'v1',
                published_at: '2024-01-01T00:00:00Z',
                body: ''
              }
            ]),
            { status: 200 }
          )
        : new Response('unavailable', { status: 503 })
    })
    await expect(getGithubReleases()).resolves.toEqual([])
  })
})
