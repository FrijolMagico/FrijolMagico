import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true
  },
  cacheComponents: true,
  images: {
    ...(isDev ? {} : { minimumCacheTTL: 2678400 }),
    qualities: [100, 75],
    loader: isDev ? 'custom' : 'default',
    loaderFile: isDev ? './src/lib/dev-image-loader.ts' : undefined,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.frijolmagico.cl',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn-dev.frijolmagico.cl',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
