export function extractDominantColors(
  imgElement: HTMLImageElement,
): string[] | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx || !imgElement.naturalWidth || !imgElement.naturalHeight) {
    return null
  }

  canvas.width = imgElement.naturalWidth
  canvas.height = imgElement.naturalHeight

  try {
    ctx.drawImage(imgElement, 0, 0)

    const startX = Math.floor(canvas.width * 0.1)
    const startY = Math.floor(canvas.height * 0.1)
    const extractWidth = Math.floor(canvas.width * 0.8)
    const extractHeight = Math.floor(canvas.height * 0.8)

    const imageData = ctx.getImageData(
      startX,
      startY,
      extractWidth,
      extractHeight,
    )
    const data = imageData.data

    const colorCounts: Map<string, number> = new Map()
    const maxSamples = 10000
    const step = Math.max(1, Math.floor(data.length / 4 / maxSamples))

    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a < 128) continue

      const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
    }

    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => `rgb(${color})`)

    const filteredColors: string[] = []
    const minDistance = 60

    for (const color of sortedColors) {
      if (filteredColors.length >= 5) break

      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]

      const isTooSimilar = filteredColors.some((existingColor) => {
        const existingRgb = existingColor.match(/\d+/g)?.map(Number) || [
          0, 0, 0,
        ]
        const distance = Math.sqrt(
          (rgb[0] - existingRgb[0]) ** 2 +
            (rgb[1] - existingRgb[1]) ** 2 +
            (rgb[2] - existingRgb[2]) ** 2,
        )
        return distance < minDistance
      })

      if (!isTooSimilar) {
        filteredColors.push(color)
      }
    }

    return filteredColors.length > 0 ? filteredColors : null
  } catch {
    return null
  }
}
