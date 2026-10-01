import { beforeEach, describe, expect, mock, test } from 'bun:test'
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
  return new NextRequest(`http://localhost/api/revalidate?${query}`, { headers })
}

describe('POST /api/revalidate', () => {
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
})
