import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Mahalla boundary polygons are sent through Server Actions and can exceed the 1 MB default.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
