/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/contact',
        destination: '/en/contact',
        permanent: false,
      },
      {
        source: '/projects',
        destination: '/en/projects',
        permanent: false,
      },
      {
        source: '/projects/:id',
        destination: '/en/projects/:id',
        permanent: false,
      },
    ];
  },
}

export default nextConfig
