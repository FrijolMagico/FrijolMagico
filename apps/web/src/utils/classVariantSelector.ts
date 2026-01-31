import type { Selector } from '@/types/media-queries'

interface Variants {
  base: string[]
  sm: string[]
  md: string[]
  lg: string[]
  xl: string[]
}

interface Props {
  variants: Variants
  selector: Selector
}

/**
 * Selecciona clases CSS de variantes basadas en breakpoints responsivos.
 *
 * @throws {Error} En desarrollo, lanza error si el valor está fuera del rango válido (1 a maxValue)
 */
export const classVariantSelector = ({ variants, selector }: Props) => {
  const selectorEntries = Object.entries(selector)
  const maxValue = variants.base.length

  return selectorEntries
    .map(([key, value]) => {
      // Validación en desarrollo para detectar errores de configuración
      if (process.env.NODE_ENV === 'development') {
        if (value < 1 || value > maxValue) {
          throw new Error(
            `[Grid] Valor "${value}" fuera de rango para "${key}". ` +
              `Debe estar entre 1 y ${maxValue}.`,
          )
        }
      }
      // -1 because the array is 0-indexed and the selector is 1-indexed
      return variants[key as keyof Variants][value - 1]
    })
    .join(' ')
}
