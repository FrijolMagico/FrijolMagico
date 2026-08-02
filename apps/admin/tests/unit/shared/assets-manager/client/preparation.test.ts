import { describe, expect, test } from 'bun:test'

import {
  ASSET_TARGET,
  createPreparationController,
  LADDER_STEP,
  MAX_RE_ENCODES,
  MIN_BPP,
  prepareAsset,
  type AssetCodec,
  type AssetSource,
  type ResizeSpec
} from '../../../../../src/shared/assets-manager/client/preparation'
import { DEFAULT_WEBP_QUALITY } from '../../../../../src/shared/assets-manager/format-config'
import { ARTIST_AVATAR_PREPARATION_SPEC } from '../../../../../src/app/(core)/artistas/catalogo/_lib/artist-avatar-preparation-policy'

const source: AssetSource = {
  name: 'portrait.png',
  type: 'image/png',
  size: 100,
  blob: new Blob(['source'])
}

function createCodec(overrides: Partial<AssetCodec> = {}): AssetCodec {
  return {
    createPreview: () => 'blob:preview',
    revokePreview: () => {},
    decode: async () => ({ width: 1000, height: 900, close: () => {} }),
    encodeWebp: async () =>
      new Blob([new Uint8Array(64 * 1024)], { type: 'image/webp' }),
    ...overrides
  }
}

function createRecordingCodec(
  blob: Blob = new Blob([new Uint8Array(64 * 1024)], { type: 'image/webp' })
) {
  const qualities: number[] = []
  const codec = createCodec({
    encodeWebp: async (_image, _width, _height, quality) => {
      qualities.push(quality)
      return blob
    }
  })
  return { codec, qualities }
}

describe('asset preparation', () => {
  test('prepares an asset according to its injected resize specification', async () => {
    const resize: ResizeSpec = {
      resolve: () => ({ width: 640, height: 360 })
    }

    const result = await prepareAsset({
      source,
      codec: createCodec(),
      resize
    })

    expect(result).toMatchObject({
      phase: 'ready',
      preparedAsset: {
        width: 640,
        height: 360,
        mimeType: 'image/webp',
        extension: 'webp'
      }
    })
    expect(result.preparedAsset?.blob.size).toBe(64 * 1024)
  })

  test('accepts an optional quality in an injected resize specification', async () => {
    const resize: ResizeSpec = {
      quality: 0.9,
      resolve: () => ({ width: 640, height: 360 })
    }

    const result = await prepareAsset({
      source,
      codec: createCodec(),
      resize
    })

    expect(result.phase).toBe('ready')
  })

  test('resolves default, explicit, and generic WebP quality policies', async () => {
    const defaultCodec = createRecordingCodec()
    const explicitCodec = createRecordingCodec()
    const genericCodec = createRecordingCodec()

    await prepareAsset({
      source,
      codec: defaultCodec.codec,
      resize: { resolve: () => ({ width: 640, height: 360 }) }
    })
    await prepareAsset({
      source,
      codec: explicitCodec.codec,
      resize: { quality: 0.9, resolve: () => ({ width: 640, height: 360 }) }
    })
    await prepareAsset({ source, codec: genericCodec.codec })

    expect(defaultCodec.qualities).toEqual([DEFAULT_WEBP_QUALITY])
    expect(explicitCodec.qualities).toEqual([0.9])
    expect(genericCodec.qualities).toEqual([DEFAULT_WEBP_QUALITY])
  })

  test('re-encodes below-floor output through the bounded quality ladder', async () => {
    const { codec, qualities } = createRecordingCodec(
      new Blob(['tiny'], { type: 'image/webp' })
    )

    const result = await prepareAsset({
      source,
      codec,
      resize: { resolve: () => ({ width: 640, height: 360 }) }
    })

    expect(MIN_BPP).toBe(0.4)
    expect(MAX_RE_ENCODES).toBe(2)
    expect(qualities).toEqual([
      DEFAULT_WEBP_QUALITY,
      DEFAULT_WEBP_QUALITY + LADDER_STEP,
      1
    ])
    expect(result).toMatchObject({
      phase: 'ready',
      preparedAsset: { blob: new Blob(['tiny'], { type: 'image/webp' }) }
    })
  })

  test('cancels before a below-floor retry and releases its preview', async () => {
    const controller = new AbortController()
    let revoked = 0
    const { codec, qualities } = createRecordingCodec(
      new Blob(['tiny'], { type: 'image/webp' })
    )
    const abortingCodec: AssetCodec = {
      ...codec,
      revokePreview: () => {
        revoked += 1
      },
      encodeWebp: async (image, width, height, quality, signal) => {
        const blob = await codec.encodeWebp(
          image,
          width,
          height,
          quality,
          signal
        )
        controller.abort()
        return blob
      }
    }

    const result = await prepareAsset({
      source,
      codec: abortingCodec,
      signal: controller.signal,
      resize: { resolve: () => ({ width: 640, height: 360 }) }
    })

    expect(result).toMatchObject({ phase: 'cancelled', preparedAsset: null })
    expect(qualities).toEqual([DEFAULT_WEBP_QUALITY])
    expect(revoked).toBe(1)
  })

  test('encodes a lossless target once and applies the cap after the ladder', async () => {
    const lossless = createRecordingCodec(
      new Blob(['tiny'], { type: 'image/webp' })
    )
    const oversized = createRecordingCodec()
    oversized.codec.encodeWebp = async (_image, _width, _height, quality) => {
      oversized.qualities.push(quality)
      return quality === 1
        ? new Blob([new Uint8Array(1024 * 1024 + 1)], {
            type: 'image/webp'
          })
        : new Blob(['tiny'], { type: 'image/webp' })
    }

    const losslessResult = await prepareAsset({
      source,
      codec: lossless.codec,
      resize: { quality: 1, resolve: () => ({ width: 640, height: 360 }) }
    })
    const oversizedResult = await prepareAsset({
      source,
      codec: oversized.codec,
      resize: { resolve: () => ({ width: 640, height: 360 }) }
    })

    expect(losslessResult.phase).toBe('ready')
    expect(lossless.qualities).toEqual([1])
    expect(oversized.qualities).toEqual([
      DEFAULT_WEBP_QUALITY,
      DEFAULT_WEBP_QUALITY + LADDER_STEP,
      1
    ])
    expect(oversizedResult).toMatchObject({
      phase: 'error',
      error: 'La imágen optimizada es demasiado grande.',
      errorKind: 'validation'
    })
  })

  test('uses lossless quality for square artist avatars and rejects non-square inputs', async () => {
    const avatar = createRecordingCodec()
    avatar.codec.decode = async () => ({
      width: 1000,
      height: 1000,
      close: () => {}
    })
    const nonSquare = await prepareAsset({
      source,
      codec: createCodec(),
      resize: ARTIST_AVATAR_PREPARATION_SPEC
    })
    const square = await prepareAsset({
      source,
      codec: avatar.codec,
      resize: ARTIST_AVATAR_PREPARATION_SPEC
    })

    expect(square.phase).toBe('ready')
    expect(avatar.qualities).toEqual([1])
    expect(nonSquare).toMatchObject({
      phase: 'error',
      error: 'Dimensiones inválidas, la imágen debe ser cuadrada.',
      errorKind: 'validation'
    })
  })

  test('rejects decoded dimensions when the injected resize specification declines them', async () => {
    const resize: ResizeSpec = { resolve: () => null }

    const result = await prepareAsset({
      source,
      codec: createCodec(),
      resize
    })

    expect(result).toMatchObject({
      phase: 'error',
      preview: null,
      preparedAsset: null,
      errorKind: 'validation'
    })
  })

  test('requires a resize specification for target-bearing legacy calls', async () => {
    const result = await prepareAsset({
      target: ASSET_TARGET.ARTIST_AVATAR,
      source,
      codec: createCodec()
    })

    expect(result).toMatchObject({
      phase: 'error',
      preview: null,
      preparedAsset: null,
      error: 'Se requiere una política de redimensionamiento.',
      errorKind: 'validation'
    })
  })

  test('prepares a valid avatar as canonical WebP with truthful indeterminate phases', async () => {
    const phases: string[] = []

    const result = await prepareAsset({
      source: { ...source, name: 'portrait.webp', type: 'image/webp' },
      codec: createCodec({
        decode: async () => ({ width: 1000, height: 1000, close: () => {} })
      }),
      resize: { resolve: () => ({ width: 800, height: 800 }) },
      onPhase: (phase) => phases.push(phase)
    })

    expect(result).toMatchObject({
      phase: 'ready',
      preview: { url: 'blob:preview' }
    })
    expect(result.preparedAsset?.blob.type).toBe('image/webp')
    expect(phases).toEqual(['validating', 'decoding', 'optimizing', 'ready'])
  })

  test('blocks rejected formats, undersized images, codec errors, and oversized output', async () => {
    const rejected = await prepareAsset({
      source: { ...source, type: 'image/svg+xml' },
      codec: createCodec()
    })
    const undersized = await prepareAsset({
      source,
      codec: createCodec({
        decode: async () => ({ width: 799, height: 900, close: () => {} })
      })
    })
    const failed = await prepareAsset({
      source,
      codec: createCodec({
        encodeWebp: async () => {
          throw new Error('codec unavailable')
        }
      })
    })
    let revoked = 0
    const oversized = await prepareAsset({
      source,
      codec: createCodec({
        revokePreview: () => {
          revoked += 1
        },
        encodeWebp: async () =>
          new Blob([new Uint8Array(1024 * 1024 + 1)], { type: 'image/webp' })
      })
    })

    expect(rejected).toMatchObject({
      phase: 'error',
      preparedAsset: null,
      errorKind: 'validation'
    })
    expect(undersized).toMatchObject({
      phase: 'error',
      preparedAsset: null,
      errorKind: 'validation'
    })
    expect(failed).toMatchObject({
      phase: 'error',
      preparedAsset: null,
      errorKind: 'unknown'
    })
    expect(oversized).toMatchObject({
      phase: 'error',
      error: 'La imágen optimizada es demasiado grande.',
      preview: null,
      preparedAsset: null,
      errorKind: 'validation'
    })
    expect(revoked).toBe(1)
  })

  test('rejects invalid source bytes and dimensions before preview allocation', async () => {
    let previews = 0
    const codec = createCodec({
      createPreview: () => {
        previews += 1
        return 'blob:preview'
      },
      decode: async () => ({ width: 799, height: 900, close: () => {} })
    })

    const oversized = await prepareAsset({
      source: { ...source, size: 10 * 1024 * 1024 + 1 },
      codec
    })
    const invalidDimensions = await prepareAsset({
      source,
      codec
    })

    expect(oversized).toMatchObject({
      phase: 'error',
      preview: null,
      errorKind: 'validation'
    })
    expect(invalidDimensions).toMatchObject({
      phase: 'error',
      preview: null,
      errorKind: 'validation'
    })
    expect(previews).toBe(0)
  })

  test('transfers a successful preview handle that releases exactly once', async () => {
    let revoked = 0
    const prepared = await prepareAsset({
      source,
      codec: createCodec({
        revokePreview: () => {
          revoked += 1
        }
      })
    })
    expect(prepared).toMatchObject({
      phase: 'ready',
      preview: { url: 'blob:preview' }
    })
    prepared.preview?.release()
    prepared.preview?.release()
    expect(revoked).toBe(1)
  })

  test('cancels stale work and disposes preview and decoded resources', async () => {
    let resolveDecode:
      | ((value: { width: number; height: number; close: () => void }) => void)
      | undefined
    let revoked = 0
    let closed = 0
    const controller = new AbortController()
    const pending = prepareAsset({
      source,
      signal: controller.signal,
      codec: createCodec({
        revokePreview: () => {
          revoked += 1
        },
        decode: () =>
          new Promise((resolve) => {
            resolveDecode = resolve
          })
      })
    })

    controller.abort()
    resolveDecode?.({
      width: 1000,
      height: 900,
      close: () => {
        closed += 1
      }
    })
    await expect(pending).resolves.toMatchObject({
      phase: 'cancelled',
      preparedAsset: null
    })
    expect({ revoked, closed }).toEqual({ revoked: 0, closed: 1 })
  })

  test('reselection invalidates the previous generation and releases error resources', async () => {
    let resolveFirst:
      | ((value: { width: number; height: number; close: () => void }) => void)
      | undefined
    const previews: string[] = []
    const controller = createPreparationController(
      createCodec({
        createPreview: () => {
          const preview = `blob:${previews.length + 1}`
          previews.push(preview)
          return preview
        },
        revokePreview: (preview) =>
          previews.splice(previews.indexOf(preview), 1),
        decode: () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      })
    )

    const first = controller.prepare({
      source
    })
    const second = controller.prepare({
      source
    })
    controller.cancel()
    resolveFirst?.({ width: 1000, height: 900, close: () => {} })
    await expect(first).resolves.toMatchObject({
      phase: 'cancelled',
      preparedAsset: null
    })
    await expect(second).resolves.toMatchObject({
      phase: 'cancelled',
      preparedAsset: null
    })
    expect(previews).toEqual([])
  })

  test('releases a stale successful preview after a newer preparation starts', async () => {
    let resolveFirst: ((value: Blob) => void) | undefined
    let revoked = 0
    const controller = createPreparationController(
      createCodec({
        revokePreview: () => {
          revoked += 1
        },
        encodeWebp: () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      })
    )
    const first = controller.prepare({
      source
    })
    const second = controller.prepare({
      source
    })
    resolveFirst?.(
      new Blob([new Uint8Array(64 * 1024)], { type: 'image/webp' })
    )
    await expect(first).resolves.toMatchObject({
      phase: 'cancelled',
      preview: null
    })
    controller.cancel()
    await expect(second).resolves.toMatchObject({
      phase: 'cancelled',
      preview: null
    })
    expect(revoked).toBe(1)
  })
})
