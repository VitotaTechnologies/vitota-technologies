/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/auth/login': ['./node_modules/argon2/prebuilds/linux-x64/argon2.glibc.node'],
      '/api/auth/register': ['./node_modules/argon2/prebuilds/linux-x64/argon2.glibc.node'],
      '/api/auth/reset-password': ['./node_modules/argon2/prebuilds/linux-x64/argon2.glibc.node'],
      '/api/client/settings/password': ['./node_modules/argon2/prebuilds/linux-x64/argon2.glibc.node'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/client/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;