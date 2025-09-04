const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  eslint: {
    // ❌ Don't block builds if ESLint errors exist
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❌ Don't block builds if TypeScript errors exist
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
