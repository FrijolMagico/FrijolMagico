/**
 * Centralized path configuration for the application
 * This file serves as a single source of truth for all routes
 */

export const paths = {
  home: {
    path: '/',
    label: 'Inicio',
    sub: {
      catalog: {
        path: '/catalogo',
        label: 'Catálogo',
        sub: {
          path: (slug: string) => `/catalogo/${slug}`,
          label: (name: string) => name
        }
      },
      about: { path: '/nosotros', label: 'Nosotros' },
      festival: {
        path: '/festivales',
        label: 'Festivales'
      }
    }
  }
} as const

// Helper types for type safety
type ValueOf<T> = T[keyof T]
export type AppPath =
  | ValueOf<typeof paths.home.sub>
  | (typeof paths.home.sub.catalog.sub extends { path: infer P } ? P : never)
