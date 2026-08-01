import {
  ASSET_TARGET,
  PREPARATION_PHASE,
  type AssetTarget,
  type LocalPreviewHandle,
  type PreparationPhase,
  type PreparedAsset
} from './contracts'

export { ASSET_TARGET }
export type { AssetTarget, LocalPreviewHandle, PreparedAsset }

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SOURCE_BYTES = 10 * 1024 * 1024
const MAX_OUTPUT_BYTES = 1024 * 1024
const OUTPUT_WIDTH = 800

export interface AssetSource {
  name: string
  type: string
  size: number
  blob: Blob
}
export interface DecodedImage {
  width: number
  height: number
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
    signal?: AbortSignal
  ) => Promise<Blob>
}
interface PrepareAssetInput {
  target: AssetTarget
  source: AssetSource
  codec: AssetCodec
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

function dimensionsFor(
  target: AssetTarget,
  image: DecodedImage
): { width: number; height: number } | null {
  if (target === ASSET_TARGET.ARTIST_AVATAR)
    return image.width === image.height && image.width >= OUTPUT_WIDTH
      ? { width: OUTPUT_WIDTH, height: OUTPUT_WIDTH }
      : null
  return image.width >= OUTPUT_WIDTH
    ? {
        width: OUTPUT_WIDTH,
        height: Math.round((image.height * OUTPUT_WIDTH) / image.width)
      }
    : null
}

export async function prepareAsset(
  input: PrepareAssetInput
): Promise<PreparationResult> {
  const { codec, onPhase, signal, source, target } = input
  onPhase?.(PREPARATION_PHASE.VALIDATING)
  if (!ACCEPTED_MIME_TYPES.has(source.type) || source.size > MAX_SOURCE_BYTES)
    return result(
      PREPARATION_PHASE.ERROR,
      'Tipo de archivo no soportado o demasiado grande.',
      'validation'
    )
  let image: DecodedImage | null = null
  let preview: LocalPreviewHandle | null = null
  let succeeded = false
  try {
    onPhase?.(PREPARATION_PHASE.DECODING)
    image = await codec.decode(source.blob, signal)
    const dimensions = dimensionsFor(target, image)
    if (!dimensions)
      return result(
        PREPARATION_PHASE.ERROR,
        'Dimensiones inválidas, la imágen debe ser cuadrada.',
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
    const blob = await codec.encodeWebp(
      image,
      dimensions.width,
      dimensions.height,
      signal
    )
    if (signal?.aborted) return result(PREPARATION_PHASE.CANCELLED)
    if (blob.type !== 'image/webp' || blob.size > MAX_OUTPUT_BYTES)
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
      preparedAsset: { blob, ...dimensions, mimeType: 'image/webp' },
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
