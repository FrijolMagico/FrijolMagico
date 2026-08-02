import type { ResizeSpec } from '@/shared/assets-manager/client/contracts'

const ARTIST_AVATAR_OUTPUT_SIZE = 800

export const ARTIST_AVATAR_PREPARATION_SPEC: ResizeSpec = {
  invalidDimensionsMessage:
    'Dimensiones inválidas, la imágen debe ser cuadrada.',
  resolve: (image) =>
    image.width === image.height && image.width >= ARTIST_AVATAR_OUTPUT_SIZE
      ? {
          width: ARTIST_AVATAR_OUTPUT_SIZE,
          height: ARTIST_AVATAR_OUTPUT_SIZE
        }
      : null
}
