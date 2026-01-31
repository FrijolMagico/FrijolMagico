/**
 * Calcula la luminancia relativa de un color RGB según WCAG 2.0
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calcula el ratio de contraste entre dos colores según WCAG 2.0
 * El fondo blanco tiene luminancia = 1.0
 */
function getContrastRatio(r: number, g: number, b: number): number {
  const luminance = getRelativeLuminance(r, g, b)
  const whiteLuminance = 1.0
  // Ratio = (lighter + 0.05) / (darker + 0.05)
  return (whiteLuminance + 0.05) / (luminance + 0.05)
}

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

    // Analizar el 100% de la imagen (sin recortar bordes)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Contar frecuencia de colores (agrupados por cubos de 16x16x16)
    const colorCounts: Map<string, number> = new Map()
    const maxSamples = 10000
    const step = Math.max(1, Math.floor(data.length / 4 / maxSamples))

    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Ignorar píxeles transparentes
      if (a < 128) continue

      // Agrupar colores similares (reducción de 256^3 a 16^3 espacios)
      const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
    }

    // Ordenar por frecuencia y calcular contraste con fondo blanco
    const sortedColors = Array.from(colorCounts.entries())
      .map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number)
        const contrast = getContrastRatio(r, g, b)
        return { color, count, contrast, rgb: [r, g, b] }
      })
      // Priorizar colores con MAYOR contraste (más oscuros)
      // Peso: 70% contraste + 30% frecuencia
      .sort((a, b) => {
        const scoreA = a.contrast * 0.7 + (a.count / colorCounts.size) * 0.3
        const scoreB = b.contrast * 0.7 + (b.count / colorCounts.size) * 0.3
        return scoreB - scoreA
      })

    // Filtrar colores muy similares entre sí (diversidad)
    const filteredColors: string[] = []
    const minDistance = 60 // Distancia mínima euclidiana en espacio RGB

    for (const colorData of sortedColors) {
      if (filteredColors.length >= 4) break

      const rgb = colorData.rgb

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
        filteredColors.push(`rgb(${colorData.color})`)
      }
    }

    // Retornar exactamente 4 colores (o null si no hay suficientes)
    return filteredColors.length === 4 ? filteredColors : null
  } catch {
    return null
  }
}
