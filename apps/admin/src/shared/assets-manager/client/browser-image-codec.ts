import type { AssetCodec, DecodedImage } from './preparation'
import { ASSET_OUTPUT_FORMAT } from '../format-config'

interface BrowserImageBitmap {
  width: number
  height: number
  close: () => void
}
interface BrowserCanvas {
  width: number
  height: number
  getContext: (contextId: '2d') => {
    imageSmoothingQuality: 'low' | 'medium' | 'high'
    drawImage: (
      source: unknown,
      x: number,
      y: number,
      width: number,
      height: number
    ) => void
  } | null
  toBlob: (
    callback: (blob: Blob | null) => void,
    type?: string,
    quality?: number
  ) => void
}
export interface BrowserImageApi {
  createObjectURL: (source: Blob) => string
  revokeObjectURL: (url: string) => void
  createImageBitmap: (source: Blob) => Promise<BrowserImageBitmap>
  createCanvas: () => BrowserCanvas
}

const browserImageApi: BrowserImageApi = {
  createObjectURL: (source) => URL.createObjectURL(source),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
  createImageBitmap: (source) => createImageBitmap(source),
  createCanvas: () => {
    const canvas = document.createElement('canvas')
    return {
      get width() {
        return canvas.width
      },
      set width(value) {
        canvas.width = value
      },
      get height() {
        return canvas.height
      },
      set height(value) {
        canvas.height = value
      },
      getContext: () => {
        const context = canvas.getContext('2d')
        return context
          ? {
              drawImage: (source, x, y, width, height) =>
                context.drawImage(
                  source as CanvasImageSource,
                  x,
                  y,
                  width,
                  height
                ),
              get imageSmoothingQuality() {
                return context.imageSmoothingQuality
              },
              set imageSmoothingQuality(value) {
                context.imageSmoothingQuality = value
              }
            }
          : null
      },
      toBlob: (callback, type, quality) =>
        canvas.toBlob(callback, type, quality)
    }
  }
}

export function createBrowserImageCodec(
  browser: BrowserImageApi = browserImageApi
): AssetCodec {
  return {
    createPreview: (source) => browser.createObjectURL(source),
    revokePreview: (url) => browser.revokeObjectURL(url),
    async decode(source) {
      const bitmap = await browser.createImageBitmap(source)
      return {
        width: bitmap.width,
        height: bitmap.height,
        source: bitmap,
        close: () => bitmap.close()
      }
    },
    async encodeWebp(image: DecodedImage, width, height, quality) {
      if (!image.source) throw new Error('Decoded image source unavailable')
      const canvas = browser.createCanvas()
      canvas.width = width
      canvas.height = height
      try {
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas context unavailable')
        context.imageSmoothingQuality = 'high'
        context.drawImage(image.source, 0, 0, width, height)
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, ASSET_OUTPUT_FORMAT.mimeType, quality)
        )
        if (!blob) throw new Error('WebP encoding failed')
        return blob
      } finally {
        canvas.width = 0
        canvas.height = 0
      }
    }
  }
}
