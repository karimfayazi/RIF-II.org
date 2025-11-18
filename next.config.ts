import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true, // For Plesk hosting compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rif-ii.org',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Ensure static files are served correctly
  trailingSlash: false,
  // Disable TypeScript errors during build (warnings only)
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch real errors
  },
};

export default nextConfig;
