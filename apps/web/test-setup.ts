import { GlobalWindow } from 'happy-dom'

const window = new GlobalWindow({ url: 'http://localhost:3000' })

for (const key of Object.keys(window)) {
  const value = window[key as keyof typeof window]
  if (!(key in globalThis)) {
    ;(globalThis as unknown as Record<string, unknown>)[key] = value
  }
}

globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.requestAnimationFrame =
  globalThis.requestAnimationFrame ??
  ((callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number)
