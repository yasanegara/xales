import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async rewrites() {
    return [
      { source: '/@:username', destination: '/u/:username' },
      { source: '/@:username/:slug', destination: '/u/:username/:slug' },
    ]
  },
}

export default nextConfig
