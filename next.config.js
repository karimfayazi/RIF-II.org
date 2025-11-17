/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true, // For Plesk hosting compatibility
  },
  // Ensure static files are served correctly
  trailingSlash: false,
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (warnings only)
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch real errors
  },
}

module.exports = nextConfig

