'use client'

import Script from 'next/script'

import { GA_MEASUREMENT_ID } from '@/config/analytics'

/**
 * Google Analytics 4 component
 * Only loads in production environment
 */
export const GoogleAnalytics = () => {
  // Skip analytics in development
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  // Skip if no measurement ID is configured
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='afterInteractive'
      />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
