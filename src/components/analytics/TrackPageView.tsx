'use client'

import { useEffect } from 'react'

import { useAnalytics } from './useAnalytics'

interface TrackPageViewProps {
  sectionName: string
  sectionPath: string
}

/**
 * Client component that tracks page views on mount.
 * Use this in Server Components to track section views.
 * Renders nothing visible - only dispatches analytics event.
 */
export const TrackPageView = ({
  sectionName,
  sectionPath,
}: TrackPageViewProps) => {
  const { trackSectionView } = useAnalytics()

  useEffect(() => {
    trackSectionView({
      section_name: sectionName,
      section_path: sectionPath,
    })
  }, [sectionName, sectionPath, trackSectionView])

  return null
}
