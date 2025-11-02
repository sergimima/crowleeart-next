import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [],
    unoptimized: false,
    domains: ['crowleeart.com', 'crowleeart.co.uk'],
  },

  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
