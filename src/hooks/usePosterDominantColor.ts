import { useState, useEffect, useRef } from 'react'
import { extractDominantColors } from '@/utils/extractDominantColor'

export function usePosterDominantColor() {
  const [dominantColors, setDominantColors] = useState<string[] | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const findAndExtractColors = () => {
      const parent = ref.current?.parentElement
      if (!parent) return null

      const article = parent.querySelector('article')
      if (!article) return null

      const img = article.querySelector('img')
      if (!img || !(img instanceof HTMLImageElement)) return null

      if (img.complete) {
        return extractDominantColors(img)
      }

      return new Promise<string[] | null>((resolve) => {
        img.onload = () => {
          resolve(extractDominantColors(img))
        }
        img.onerror = () => resolve(null)
      })
    }

    const runExtraction = async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const colors = await findAndExtractColors()
      setDominantColors(colors)
    }

    runExtraction()
  }, [])

  return { dominantColors, ref }
}
