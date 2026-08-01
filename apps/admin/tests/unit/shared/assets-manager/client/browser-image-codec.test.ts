import { describe, expect, test } from 'bun:test'

import {
  createBrowserImageCodec,
  type BrowserImageApi
} from '../../../../../src/shared/assets-manager/client/browser-image-codec'
import {
  ASSET_TARGET,
  prepareAsset
} from '../../../../../src/shared/assets-manager/client/preparation'

describe('browser image codec seam', () => {
  test('delegates URL, bitmap, and canvas ownership to injected browser APIs', async () => {
    const calls: string[] = []
    const bitmap = {
      width: 1000,
      height: 800,
      close: () => calls.push('close')
    }
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: () => calls.push('draw') }),
      toBlob: (callback: (blob: Blob | null) => void) =>
        callback(new Blob(['webp'], { type: 'image/webp' }))
    }
    const browser: BrowserImageApi = {
      createObjectURL: () => 'blob:preview',
      revokeObjectURL: (url) => calls.push(`revoke:${url}`),
      createImageBitmap: async () => bitmap,
      createCanvas: () => canvas
    }
    const codec = createBrowserImageCodec(browser)
    const preview = codec.createPreview(new Blob(['source']))
    const decoded = await codec.decode(new Blob(['source']))
    const encoded = await codec.encodeWebp(decoded, 800, 640)
    decoded.close()
    codec.revokePreview(preview)
    expect({
      preview,
      encodedType: encoded.type,
      size: [canvas.width, canvas.height],
      calls
    }).toEqual({
      preview: 'blob:preview',
      encodedType: 'image/webp',
      size: [0, 0],
      calls: ['draw', 'close', 'revoke:blob:preview']
    })
  })

  test('cleans canvas, bitmap, and preview when context or Blob is unavailable', async () => {
    for (const available of [false, true]) {
      let revoked = 0
      let closed = 0
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => (available ? { drawImage: () => {} } : null),
        toBlob: (callback: (blob: Blob | null) => void) => callback(null)
      }
      const codec = createBrowserImageCodec({
        createObjectURL: () => 'blob:preview',
        revokeObjectURL: () => {
          revoked += 1
        },
        createImageBitmap: async () => ({
          width: 1000,
          height: 800,
          close: () => {
            closed += 1
          }
        }),
        createCanvas: () => canvas
      })
      const result = await prepareAsset({
        target: ASSET_TARGET.EDITION_POSTER,
        source: {
          name: 'poster.png',
          type: 'image/png',
          size: 1,
          blob: new Blob(['source'])
        },
        codec
      })
      expect(result).toMatchObject({
        phase: 'error',
        preview: null,
        preparedAsset: null
      })
      expect({
        width: canvas.width,
        height: canvas.height,
        revoked,
        closed
      }).toEqual({ width: 0, height: 0, revoked: 1, closed: 1 })
    }
  })
})
