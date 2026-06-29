/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Keep the headless-Chromium deps out of the bundle so the binary resolves at runtime
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
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
