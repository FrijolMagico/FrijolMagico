import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true
  },
  cacheComponents: true,
  images: {
    minimumCacheTTL: 2678400,
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.frijolmagico.cl',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
