import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coverartarchive.org',
        pathname: '/release/**',
      },
      {
        protocol: 'https',
        hostname: 'coverartarchive.org',
        pathname: '/release-group/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/thumb/**',
      },
    ],
  },
};

export default nextConfig;