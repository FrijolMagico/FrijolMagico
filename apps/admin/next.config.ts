import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.frijolmagico.cl',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
