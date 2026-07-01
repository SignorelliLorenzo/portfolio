/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/en/projects',
        permanent: true,
      },
      {
        source: '/projects/:id',
        destination: '/en/projects/:id',
        permanent: true,
      },
      {
        source: '/resume',
        destination: '/en/resume',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
