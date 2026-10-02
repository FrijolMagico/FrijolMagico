import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { NextRequest } from 'next/server'

const cacheLifeMock = mock<(profile: { stale?: number; revalidate?: number; expire?: number }) => void>(() => {})
const cacheTagMock = mock<(tag: string) => void>(() => {})
const revalidateTagMock = mock<(tag: string, profile: string | { expire?: number }) => void>(() => {})
const headersMock = mock(async () => new Headers())

mock.module('next/cache', () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
  revalidateTag: revalidateTagMock
}))

mock.module('next/headers', () => ({ headers: headersMock }))

import { GET, POST } from './route'

const RUN_ID = '550e8400-e29b-41d4-a716-446655440000'
const SECRET = 'test-probe-secret'

const createRequest = (
  method: 'GET' | 'POST',
  query: string,
  authorization = `Bearer ${SECRET}`
) => new NextRequest(`http://localhost/api/cache-probe?${query}`, {
  method,
  headers: { Authorization: authorization }
})

const expectNoStore = (response: Response) => {
  expect(response.headers.get('Cache-Control')).toContain('no-store')
  expect(response.headers.get('CDN-Cache-Control')).toBe('no-store')
  expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe('no-store')
}

beforeEach(() => {
  process.env.VERCEL_ENV = 'preview'
  process.env.CACHE_PROBE_SECRET = SECRET
  cacheLifeMock.mockClear()
  cacheTagMock.mockClear()
  revalidateTagMock.mockClear()
  headersMock.mockClear()
})

describe('temporary Preview cache probe', () => {
  test('GET returns a cached generation and stable process identity with private isolated tag and bounded lifetime', async () => {
    const response = await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ runId: RUN_ID, mode: 'swr' })
    expect(payload.generation).toEqual(expect.any(String))
    expect(payload.createdAt).toEqual(expect.any(String))
    expect(payload.instanceId).toMatch(/^[0-9a-f-]{36}$/)
    expectNoStore(response)
    expect(headersMock).toHaveBeenCalledTimes(1)
    expect(cacheTagMock).toHaveBeenCalledWith(`cache-probe:${RUN_ID}:swr`)
    expect(cacheLifeMock).toHaveBeenCalledWith({ stale: 0, revalidate: 60, expire: 300 })

    const next = await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`))
    expect((await next.json()).instanceId).toBe(payload.instanceId)
  })

  test('keeps modes and run IDs in separate cache tags', async () => {
    await GET(createRequest('GET', `runId=${RUN_ID}&mode=immediate`))
    await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`))
    await GET(createRequest('GET', `runId=550e8400-e29b-41d4-a716-446655440001&mode=swr`))

    expect(cacheTagMock.mock.calls).toEqual([
      [`cache-probe:${RUN_ID}:immediate`],
      [`cache-probe:${RUN_ID}:swr`],
      ['cache-probe:550e8400-e29b-41d4-a716-446655440001:swr']
    ])
  })

  test.each([
    ['malformed UUID', 'runId=bad&mode=swr'],
    ['unknown mode', `runId=${RUN_ID}&mode=other`],
    ['missing mode', `runId=${RUN_ID}`],
    ['unknown parameter', `runId=${RUN_ID}&mode=swr&tag=live`],
    ['duplicate parameter', `runId=${RUN_ID}&runId=${RUN_ID}&mode=swr`]
  ])('rejects %s without using the cache', async (_case, query) => {
    const response = await GET(createRequest('GET', query))

    expect(response.status).toBe(400)
    expectNoStore(response)
    expect(cacheTagMock).not.toHaveBeenCalled()
  })

  test('fails closed outside Preview and when the dedicated secret is missing', async () => {
    process.env.VERCEL_ENV = 'production'
    const outsidePreview = await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`))
    expect(outsidePreview.status).toBe(404)
    expectNoStore(outsidePreview)

    process.env.VERCEL_ENV = 'preview'
    delete process.env.CACHE_PROBE_SECRET
    const missingSecret = await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`))
    expect(missingSecret.status).toBe(404)
    expectNoStore(missingSecret)
    expect(cacheTagMock).not.toHaveBeenCalled()
  })

  test('rejects missing or incorrect Bearer authentication without exposing secret', async () => {
    for (const authorization of ['', 'Bearer wrong-secret']) {
      const response = await GET(createRequest('GET', `runId=${RUN_ID}&mode=swr`, authorization))
      expect(response.status).toBe(401)
      expect(await response.text()).not.toContain(SECRET)
      expectNoStore(response)
    }
    expect(cacheTagMock).not.toHaveBeenCalled()
  })

  test.each([
    ['immediate', { expire: 0 }],
    ['swr', 'max']
  ] as const)('POST maps %s to only this probe tag', async (mode, profile) => {
    const response = await POST(createRequest('POST', `runId=${RUN_ID}&mode=${mode}`))

    expect(response.status).toBe(200)
    expectNoStore(response)
    expect(revalidateTagMock).toHaveBeenCalledTimes(1)
    expect(revalidateTagMock).toHaveBeenCalledWith(`cache-probe:${RUN_ID}:${mode}`, profile)
  })

  test('POST rejects invalid requests before invalidation', async () => {
    for (const query of [`runId=${RUN_ID}&mode=immediate&tag=artists`, 'runId=bad&mode=swr']) {
      const response = await POST(createRequest('POST', query))
      expect(response.status).toBe(400)
      expectNoStore(response)
    }
    expect(revalidateTagMock).not.toHaveBeenCalled()
  })
})
