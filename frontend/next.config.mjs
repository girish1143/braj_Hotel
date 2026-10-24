/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection', value: '1; mode=block' }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/hotel-admin',
        destination: '/hotel/dashboard',
        permanent: false,
      },
      {
        source: '/hotel-admin/:path*',
        destination: '/hotel/dashboard',
        permanent: false,
      },
      {
        source: '/hotel/admin',
        destination: '/hotel/dashboard',
        permanent: false,
      },
      {
        source: '/hotel/admin/:path*',
        destination: '/hotel/dashboard',
        permanent: false,
      },
      {
        source: '/hotel/dashboard/:tab+',
        destination: '/hotel/dashboard',
        permanent: false,
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/hotel/register',
        destination: '/list-property',
        permanent: false,
      },
      {
        source: '/hotel/register/:path*',
        destination: '/list-property',
        permanent: false,
      },
      {
        source: '/restaurants',
        destination: '/bhojan',
        permanent: false,
      },
      {
        source: '/restaurants/:path*',
        destination: '/bhojan',
        permanent: false,
      },
    ];
  }
};

export default nextConfig;
