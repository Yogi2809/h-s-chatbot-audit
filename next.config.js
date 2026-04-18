/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['@prisma/client'],
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      if (!config.externals) config.externals = [];
      config.externals.push({
        '@prisma/client': '@prisma/client',
      });
    }
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
