import { classVariantSelector } from '@/utils/classVariantSelector'
import { Selector } from '@/types/media-queries'
import clsx from 'clsx'

interface Props {
  row: Selector
  col: Selector
  className?: string
  hidden?: boolean
  children?: React.ReactNode
  as?: React.ElementType
}

/**
 * Componente hijo de Grid para posicionar elementos en celdas específicas.
 *
 * NOTA: Los arrays de clases están explícitamente definidos (no generados
 * dinámicamente) para garantizar que Tailwind detecte y compile todas las
 * clases necesarias. Este es un patrón conocido como "safelist pattern".
 *
 * @example
 * <GridItem row={{ base: 1, md: 2 }} col={{ base: 1, md: 3 }}>
 *   Contenido que ocupa 1 fila y 1 columna en mobile,
 *   2 filas y 3 columnas en md+
 * </GridItem>
 *
 * @example
 * // Con elemento semántico personalizado
 * <GridItem as="article" row={{ base: 1 }} col={{ base: 2 }}>
 *   ...
 * </GridItem>
 */
export const GridItem = ({
  hidden,
  children,
  as,
  row,
  col,
  className,
}: Props) => {
  const Component = as || 'div'
  return (
    <Component
      className={clsx(
        'size-full',
        hidden && 'hidden',
        classVariantSelector({
          variants: gridSpanVariants.row,
          selector: row,
        }),
        classVariantSelector({
          variants: gridSpanVariants.col,
          selector: col,
        }),
        className,
      )}>
      {children}
    </Component>
  )
}

const gridSpanVariants = {
  row: {
    base: [
      'row-span-1',
      'row-span-2',
      'row-span-3',
      'row-span-4',
      'row-span-5',
      'row-span-6',
      'row-span-7',
      'row-span-8',
      'row-span-9',
      'row-span-10',
      'row-span-11',
      'row-span-12',
    ],
    sm: [
      'sm:row-span-1',
      'sm:row-span-2',
      'sm:row-span-3',
      'sm:row-span-4',
      'sm:row-span-5',
      'sm:row-span-6',
      'sm:row-span-7',
      'sm:row-span-8',
      'sm:row-span-9',
      'sm:row-span-10',
      'sm:row-span-11',
      'sm:row-span-12',
    ],
    md: [
      'md:row-span-1',
      'md:row-span-2',
      'md:row-span-3',
      'md:row-span-4',
      'md:row-span-5',
      'md:row-span-6',
      'md:row-span-7',
      'md:row-span-8',
      'md:row-span-9',
      'md:row-span-10',
      'md:row-span-11',
      'md:row-span-12',
    ],
    lg: [
      'lg:row-span-1',
      'lg:row-span-2',
      'lg:row-span-3',
      'lg:row-span-4',
      'lg:row-span-5',
      'lg:row-span-6',
      'lg:row-span-7',
      'lg:row-span-8',
      'lg:row-span-9',
      'lg:row-span-10',
      'lg:row-span-11',
      'lg:row-span-12',
    ],
    xl: [
      'xl:row-span-1',
      'xl:row-span-2',
      'xl:row-span-3',
      'xl:row-span-4',
      'xl:row-span-5',
      'xl:row-span-6',
      'xl:row-span-7',
      'xl:row-span-8',
      'xl:row-span-9',
      'xl:row-span-10',
      'xl:row-span-11',
      'xl:row-span-12',
    ],
  },
  col: {
    base: [
      'col-span-1',
      'col-span-2',
      'col-span-3',
      'col-span-4',
      'col-span-5',
      'col-span-6',
      'col-span-7',
      'col-span-8',
      'col-span-9',
      'col-span-10',
      'col-span-11',
      'col-span-12',
    ],
    sm: [
      'sm:col-span-1',
      'sm:col-span-2',
      'sm:col-span-3',
      'sm:col-span-4',
      'sm:col-span-5',
      'sm:col-span-6',
      'sm:col-span-7',
      'sm:col-span-8',
      'sm:col-span-9',
      'sm:col-span-10',
      'sm:col-span-11',
      'sm:col-span-12',
    ],
    md: [
      'md:col-span-1',
      'md:col-span-2',
      'md:col-span-3',
      'md:col-span-4',
      'md:col-span-5',
      'md:col-span-6',
      'md:col-span-7',
      'md:col-span-8',
      'md:col-span-9',
      'md:col-span-10',
      'md:col-span-11',
      'md:col-span-12',
    ],
    lg: [
      'lg:col-span-1',
      'lg:col-span-2',
      'lg:col-span-3',
      'lg:col-span-4',
      'lg:col-span-5',
      'lg:col-span-6',
      'lg:col-span-7',
      'lg:col-span-8',
      'lg:col-span-9',
      'lg:col-span-10',
      'lg:col-span-11',
      'lg:col-span-12',
    ],
    xl: [
      'xl:col-span-1',
      'xl:col-span-2',
      'xl:col-span-3',
      'xl:col-span-4',
      'xl:col-span-5',
      'xl:col-span-6',
      'xl:col-span-7',
      'xl:col-span-8',
      'xl:col-span-9',
      'xl:col-span-10',
      'xl:col-span-11',
      'xl:col-span-12',
    ],
  },
}
