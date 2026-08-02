import { describe, expect, test } from 'bun:test'

import {
  createBrowserImageCodec,
  type BrowserImageApi
} from '../../../../../src/shared/assets-manager/client/browser-image-codec'
import {
  ASSET_OUTPUT_FORMAT,
  DEFAULT_WEBP_QUALITY
} from '../../../../../src/shared/assets-manager/format-config'
import { prepareAsset } from '../../../../../src/shared/assets-manager/client/preparation'

describe('browser image codec seam', () => {
  test('delegates URL, bitmap, and canvas ownership to injected browser APIs', async () => {
    const calls: string[] = []
    const encoding: {
      value: { type: string | undefined; quality: number | undefined } | null
    } = { value: null }
    const bitmap = {
      width: 1000,
      height: 800,
      close: () => calls.push('close')
    }
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        set imageSmoothingQuality(value: 'low' | 'medium' | 'high') {
          calls.push(`smoothing:${value}`)
        },
        drawImage: () => calls.push('draw')
      }),
      toBlob: (
        callback: (blob: Blob | null) => void,
        type?: string,
        quality?: number
      ) => {
        encoding.value = { type, quality }
        callback(new Blob(['webp'], { type: 'image/webp' }))
      }
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
    const encoded = await codec.encodeWebp(decoded, 800, 640, 0.9)
    decoded.close()
    codec.revokePreview(preview)
    expect({
      preview,
      encodedType: encoded.type,
      size: [canvas.width, canvas.height],
      calls,
      encoding: encoding.value
    }).toEqual({
      preview: 'blob:preview',
      encodedType: 'image/webp',
      size: [0, 0],
      calls: ['smoothing:high', 'draw', 'close', 'revoke:blob:preview'],
      encoding: { type: 'image/webp', quality: 0.9 }
    })
    expect(ASSET_OUTPUT_FORMAT).toEqual({
      mimeType: 'image/webp',
      extension: 'webp'
    })
  })

  test('cleans canvas, bitmap, and preview when context or Blob is unavailable', async () => {
    for (const available of [false, true]) {
      let revoked = 0
      let closed = 0
      const canvas = {
        width: 0,
        height: 0,
        getContext: () =>
          available
            ? { imageSmoothingQuality: 'low' as const, drawImage: () => {} }
            : null,
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
        source: {
          name: 'poster.png',
          type: 'image/png',
          size: 1,
          blob: new Blob(['source'])
        },
        codec,
        resize: { resolve: () => ({ width: 800, height: 640 }) }
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
