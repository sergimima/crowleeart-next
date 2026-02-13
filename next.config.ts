import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crowleeart.com',
      },
      {
        protocol: 'https',
        hostname: 'crowleeart.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'quote.simplybusiness.co.uk',
      },
    ],
    unoptimized: false,
  },

  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
