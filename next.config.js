/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/ogl/**',
        'node_modules/framer-motion/**',
        'node_modules/motion-dom/**',
        'node_modules/motion-utils/**',
        'node_modules/@img/**',
      ],
    },
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
}

module.exports = nextConfig


