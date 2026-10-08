import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  resolveWebRevalidationMode
} from '@frijolmagico/cache-tags'
import { NextRequest } from 'next/server'

const revalidatePathMock = mock(() => {})
const revalidateTagMock = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock
}))

import { POST } from './route'

beforeEach(() => {
  process.env.REVALIDATION_SECRET = 'test-secret'
  revalidatePathMock.mockClear()
  revalidateTagMock.mockClear()
})

const createRequest = (query: string, authorization?: string) => {
  const headers = new Headers()
  if (authorization) headers.set('Authorization', authorization)
  return new NextRequest(`http://localhost/api/revalidate?${query}`, {
    headers
  })
}

describe('POST /api/revalidate', () => {
  test('resolves protected modes and preserves requested ordinary-tag modes', () => {
    expect(resolveWebRevalidationMode(FESTIVAL_CRITICAL_CACHE_TAG)).toBe(
      'immediate'
    )
    expect(
      resolveWebRevalidationMode(CANONICAL_CATALOG_SLUGS_CACHE_TAG, 'swr')
    ).toBe('immediate')
    expect(resolveWebRevalidationMode('ordinary-tag')).toBe('swr')
    expect(resolveWebRevalidationMode('ordinary-tag', 'immediate')).toBe(
      'immediate'
    )
  })

  test('rejects unauthorized requests without invalidating anything', async () => {
    const response = await POST(createRequest('tag=artists', 'Bearer wrong'))

    expect(response.status).toBe(401)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  test('defaults a missing tag mode to stale-while-revalidate and independently revalidates the path', async () => {
    const response = await POST(
      createRequest('tag=artists&path=%2Fartists', 'Bearer test-secret')
    )

    expect(response.status).toBe(200)
    expect(revalidateTagMock).toHaveBeenCalledTimes(1)
    expect(revalidateTagMock).toHaveBeenCalledWith('artists', 'max')
    expect(revalidatePathMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/artists')
  })

  test.each([FESTIVAL_CRITICAL_CACHE_TAG, CANONICAL_CATALOG_SLUGS_CACHE_TAG])(
    'defaults protected tag %s to immediate invalidation',
    async (tag) => {
      const response = await POST(
        createRequest(`tag=${encodeURIComponent(tag)}`, 'Bearer test-secret')
      )

      expect(response.status).toBe(200)
      expect(revalidateTagMock).toHaveBeenCalledWith(tag, { expire: 0 })
    }
  )

  test('accepts explicit immediate mode for protected tags', async () => {
    const response = await POST(
      createRequest(
        `tag=${encodeURIComponent(FESTIVAL_CRITICAL_CACHE_TAG)}&mode=immediate`,
        'Bearer test-secret'
      )
    )

    expect(response.status).toBe(200)
    expect(revalidateTagMock).toHaveBeenCalledWith(
      FESTIVAL_CRITICAL_CACHE_TAG,
      {
        expire: 0
      }
    )
  })

  test('rejects explicit protected SWR before invalidating any tag or path', async () => {
    const response = await POST(
      createRequest(
        `tag=${encodeURIComponent(FESTIVAL_CRITICAL_CACHE_TAG)}&mode=swr&path=%2Fartists`,
        'Bearer test-secret'
      )
    )

    expect(response.status).toBe(400)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  test('uses immediate tag invalidation when requested', async () => {
    const response = await POST(
      createRequest('tag=artists&mode=immediate', 'Bearer test-secret')
    )

    expect(response.status).toBe(200)
    expect(revalidateTagMock).toHaveBeenCalledTimes(1)
    expect(revalidateTagMock).toHaveBeenCalledWith('artists', { expire: 0 })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  test('rejects unsupported tag mode before invalidating the tag or path', async () => {
    const response = await POST(
      createRequest(
        'tag=artists&mode=unsupported&path=%2Fartists',
        'Bearer test-secret'
      )
    )

    expect(response.status).toBe(400)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  test('revalidates a path without triggering tag invalidation', async () => {
    await POST(createRequest('path=%2Fartists', 'Bearer test-secret'))

    expect(revalidatePathMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/artists')
    expect(revalidateTagMock).not.toHaveBeenCalled()
  })

  test.each(['page', 'layout'] as const)(
    'passes %s path type to revalidatePath',
    async (pathType) => {
      const response = await POST(
        createRequest(
          `path=%2Fartists&pathType=${pathType}`,
          'Bearer test-secret'
        )
      )

      expect(response.status).toBe(200)
      expect(revalidatePathMock).toHaveBeenCalledTimes(1)
      expect(revalidatePathMock).toHaveBeenCalledWith('/artists', pathType)
      expect(revalidateTagMock).not.toHaveBeenCalled()
    }
  )

  test('rejects unsupported path type before invalidating tag or path', async () => {
    const response = await POST(
      createRequest(
        'tag=artists&path=%2Fartists&pathType=unsupported',
        'Bearer test-secret'
      )
    )

    expect(response.status).toBe(400)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  test('rejects path type without a non-empty path before invalidating tag or path', async () => {
    const response = await POST(
      createRequest('tag=artists&pathType=page', 'Bearer test-secret')
    )

    expect(response.status).toBe(400)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
