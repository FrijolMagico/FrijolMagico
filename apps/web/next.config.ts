import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.frijolmagico.cl',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
