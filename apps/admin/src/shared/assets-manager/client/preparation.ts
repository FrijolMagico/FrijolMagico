import {
  ASSET_TARGET,
  PREPARATION_PHASE,
  type AssetTarget,
  type ImageDimensions,
  type LocalPreviewHandle,
  type PreparationPhase,
  type PreparedAsset
} from './contracts'
import { ASSET_OUTPUT_FORMAT, DEFAULT_WEBP_QUALITY } from '../format-config'
import type { ResizeDimensions, ResizeSpec } from './contracts'

export { ASSET_TARGET }
export type {
  AssetTarget,
  LocalPreviewHandle,
  PreparedAsset,
  ResizeDimensions,
  ResizeSpec
}

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SOURCE_BYTES = 10 * 1024 * 1024
const MAX_OUTPUT_BYTES = 1024 * 1024
export const MIN_BPP = 0.4
export const LADDER_STEP = 0.1
export const MAX_RE_ENCODES = 2

export interface AssetSource {
  name: string
  type: string
  size: number
  blob: Blob
}
export interface DecodedImage extends ImageDimensions {
  close: () => void
  source?: unknown
}
export interface AssetCodec {
  createPreview: (source: Blob) => string
  revokePreview: (url: string) => void
  decode: (source: Blob, signal?: AbortSignal) => Promise<DecodedImage>
  encodeWebp: (
    image: DecodedImage,
    width: number,
    height: number,
    quality: number,
    signal?: AbortSignal
  ) => Promise<Blob>
}
export interface PrepareAssetInput {
  target?: AssetTarget
  source: AssetSource
  codec: AssetCodec
  resize?: ResizeSpec
  signal?: AbortSignal
  onPhase?: (phase: PreparationPhase) => void
}
export type PreparationErrorKind = 'validation' | 'unknown'

export interface PreparationResult {
  phase: PreparationPhase
  preview: LocalPreviewHandle | null
  preparedAsset: PreparedAsset | null
  error: string | null
  errorKind: PreparationErrorKind | null
}

function result(
  phase: PreparationPhase,
  error: string | null = null,
  errorKind: PreparationErrorKind | null = null
): PreparationResult {
  return { phase, preview: null, preparedAsset: null, error, errorKind }
}

const GENERIC_RESIZE_SPEC: ResizeSpec = {
  resolve: (image) =>
    image.width >= 800
      ? { width: 800, height: Math.round((image.height * 800) / image.width) }
      : null
}

function hasValidDimensions(
  dimensions: ResizeDimensions,
  image: DecodedImage
): boolean {
  return (
    Number.isInteger(dimensions.width) &&
    Number.isInteger(dimensions.height) &&
    dimensions.width > 0 &&
    dimensions.height > 0 &&
    dimensions.width <= image.width &&
    dimensions.height <= image.height
  )
}

export async function prepareAsset(
  input: PrepareAssetInput
): Promise<PreparationResult> {
  const { codec, onPhase, signal, source } = input
  const resize = input.resize ?? (input.target ? null : GENERIC_RESIZE_SPEC)
  onPhase?.(PREPARATION_PHASE.VALIDATING)
  if (!ACCEPTED_MIME_TYPES.has(source.type) || source.size > MAX_SOURCE_BYTES)
    return result(
      PREPARATION_PHASE.ERROR,
      'Tipo de archivo no soportado o demasiado grande.',
      'validation'
    )
  if (!resize)
    return result(
      PREPARATION_PHASE.ERROR,
      'Se requiere una política de redimensionamiento.',
      'validation'
    )
  let image: DecodedImage | null = null
  let preview: LocalPreviewHandle | null = null
  let succeeded = false
  try {
    onPhase?.(PREPARATION_PHASE.DECODING)
    image = await codec.decode(source.blob, signal)
    const dimensions = resize.resolve(image)
    if (!dimensions || !hasValidDimensions(dimensions, image))
      return result(
        PREPARATION_PHASE.ERROR,
        resize.invalidDimensionsMessage ??
          'Dimensiones inválidas para este recurso.',
        'validation'
      )
    if (signal?.aborted) return result(PREPARATION_PHASE.CANCELLED)
    const previewUrl = codec.createPreview(source.blob)
    let previewReleased = false
    preview = {
      url: previewUrl,
      release: () => {
        if (!previewReleased) {
          previewReleased = true
          codec.revokePreview(previewUrl)
        }
      }
    }
    signal?.addEventListener('abort', preview.release, { once: true })
    onPhase?.(PREPARATION_PHASE.OPTIMIZING)
    let quality = resize.quality ?? DEFAULT_WEBP_QUALITY
    let reEncodes = 0
    let blob = await codec.encodeWebp(
      image,
      dimensions.width,
      dimensions.height,
      quality,
      signal
    )
    while (
      blob.size * 8 < MIN_BPP * dimensions.width * dimensions.height &&
      reEncodes < MAX_RE_ENCODES &&
      quality < 1
    ) {
      if (signal?.aborted) return result(PREPARATION_PHASE.CANCELLED)
      quality = Math.min(1, quality + LADDER_STEP)
      reEncodes += 1
      blob = await codec.encodeWebp(
        image,
        dimensions.width,
        dimensions.height,
        quality,
        signal
      )
    }
    if (signal?.aborted) return result(PREPARATION_PHASE.CANCELLED)
    if (
      blob.type !== ASSET_OUTPUT_FORMAT.mimeType ||
      blob.size > MAX_OUTPUT_BYTES
    )
      return result(
        PREPARATION_PHASE.ERROR,
        'La imágen optimizada es demasiado grande.',
        'validation'
      )
    onPhase?.(PREPARATION_PHASE.READY)
    succeeded = true
    return {
      phase: PREPARATION_PHASE.READY,
      preview,
      preparedAsset: {
        blob,
        width: dimensions.width,
        height: dimensions.height,
        mimeType: ASSET_OUTPUT_FORMAT.mimeType,
        extension: ASSET_OUTPUT_FORMAT.extension
      },
      error: null,
      errorKind: null
    }
  } catch (error) {
    return result(
      signal?.aborted ? PREPARATION_PHASE.CANCELLED : PREPARATION_PHASE.ERROR,
      error instanceof Error ? error.message : 'Preparation failed',
      signal?.aborted ? null : 'unknown'
    )
  } finally {
    image?.close()
    if (preview) signal?.removeEventListener('abort', preview.release)
    if (!succeeded) preview?.release()
  }
}

function cancelledResult(): PreparationResult {
  return result(PREPARATION_PHASE.CANCELLED)
}

export function createPreparationController(codec: AssetCodec): {
  prepare: (
    input: Omit<PrepareAssetInput, 'codec' | 'signal'>
  ) => Promise<PreparationResult>
  cancel: () => void
} {
  let controller: AbortController | null = null
  let generation = 0
  return {
    async prepare(input) {
      controller?.abort()
      controller = new AbortController()
      const currentGeneration = ++generation
      const signal = controller.signal
      const cancellation = new Promise<PreparationResult>((resolve) =>
        signal.addEventListener('abort', () => resolve(cancelledResult()), {
          once: true
        })
      )
      const preparation = prepareAsset({ ...input, codec, signal }).then(
        (completed) => {
          if (currentGeneration !== generation || signal.aborted)
            completed.preview?.release()
          return completed
        }
      )
      const outcome = await Promise.race([preparation, cancellation])
      if (currentGeneration === generation && !signal.aborted) return outcome
      outcome.preview?.release()
      return cancelledResult()
    },
    cancel() {
      generation += 1
      controller?.abort()
      controller = null
    }
  }
}
