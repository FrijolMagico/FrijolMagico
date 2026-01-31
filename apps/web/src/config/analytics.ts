/**
 * Google Analytics 4 configuration
 * Centralized event names and parameters for tracking
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

/**
 * Custom event names for GA4
 * Using snake_case as per GA4 conventions
 */
export const GA_EVENTS = {
  // Catalog events
  ARTIST_VIEW: 'artist_view',
  FILTER_APPLIED: 'filter_applied',
  CATALOG_SEARCH: 'catalog_search',

  // Navigation events
  SOCIAL_CLICK: 'social_click',
  SECTION_VIEW: 'section_view',

  // Festival events
  FESTIVAL_SECTION_VIEW: 'festival_section_view',
  CONVOCATORIA_VIEW: 'convocatoria_view',
} as const

/**
 * Event parameter types for type safety
 */
export type ArtistViewParams = {
  artist_name: string
  artist_category?: string
  artist_city?: string
}

export type FilterAppliedParams = {
  filter_type: string
  filter_value: string
}

export type CatalogSearchParams = {
  search_term: string
  results_count?: number
}

export type SocialClickParams = {
  platform: 'instagram' | 'facebook' | 'spotify' | 'email' | string
  location: 'footer' | 'header' | 'artist_panel' | string
}

export type SectionViewParams = {
  section_name: string
  section_path: string
}
