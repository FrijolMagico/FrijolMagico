import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
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
