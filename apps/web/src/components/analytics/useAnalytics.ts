'use client'

import { useCallback } from 'react'

import {
  GA_MEASUREMENT_ID,
  GA_EVENTS,
  type ArtistViewParams,
  type FilterAppliedParams,
  type CatalogSearchParams,
  type SocialClickParams,
  type SectionViewParams,
} from '@/config/analytics'

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void
  }
}

/**
 * Check if analytics is available
 */
const isAnalyticsAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    process.env.NODE_ENV === 'production' &&
    Boolean(GA_MEASUREMENT_ID)
  )
}

/**
 * Generic event tracking function
 */
const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>,
): void => {
  if (!isAnalyticsAvailable()) return

  window.gtag?.('event', eventName, parameters)
}

/**
 * Hook for tracking analytics events
 * All tracking functions are safe to call in any environment
 * (they will no-op if analytics is not available)
 */
export const useAnalytics = () => {
  /**
   * Track when a user views an artist's details in the catalog
   */
  const trackArtistView = useCallback((params: ArtistViewParams) => {
    trackEvent(GA_EVENTS.ARTIST_VIEW, {
      artist_name: params.artist_name,
      artist_category: params.artist_category,
      artist_city: params.artist_city,
    })
  }, [])

  /**
   * Track when a user applies a filter in the catalog
   */
  const trackFilterApplied = useCallback((params: FilterAppliedParams) => {
    trackEvent(GA_EVENTS.FILTER_APPLIED, {
      filter_type: params.filter_type,
      filter_value: params.filter_value,
    })
  }, [])

  /**
   * Track when a user searches in the catalog
   */
  const trackCatalogSearch = useCallback((params: CatalogSearchParams) => {
    trackEvent(GA_EVENTS.CATALOG_SEARCH, {
      search_term: params.search_term,
      results_count: params.results_count,
    })
  }, [])

  /**
   * Track when a user clicks on social media links
   */
  const trackSocialClick = useCallback((params: SocialClickParams) => {
    trackEvent(GA_EVENTS.SOCIAL_CLICK, {
      platform: params.platform,
      location: params.location,
    })
  }, [])

  /**
   * Track when a user views a specific section
   */
  const trackSectionView = useCallback((params: SectionViewParams) => {
    trackEvent(GA_EVENTS.SECTION_VIEW, {
      section_name: params.section_name,
      section_path: params.section_path,
    })
  }, [])

  /**
   * Track page views (for SPAs or custom navigation)
   */
  const trackPageView = useCallback((url: string) => {
    if (!isAnalyticsAvailable()) return

    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [])

  return {
    trackArtistView,
    trackFilterApplied,
    trackCatalogSearch,
    trackSocialClick,
    trackSectionView,
    trackPageView,
  }
}
