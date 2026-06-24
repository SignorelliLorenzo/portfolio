import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { BackgroundEffect } from '@/components/effects/background-effect'
import { absoluteUrl, siteUrl } from '@/lib/seo'
import './globals.css'

const defaultOgImage = absoluteUrl('/opengraph-image.png')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lorenzo Signorelli | Full-Stack Developer & AI Engineer',
    template: '%s | Lorenzo Signorelli',
  },
  description:
    'Portfolio of Lorenzo Signorelli, full-stack developer and AI engineer building scalable web apps and intelligent products.',
  keywords: [
    'Lorenzo Signorelli',
    'full-stack developer',
    'AI developer',
    'Next.js portfolio',
    'React developer',
    'machine learning engineer',
  ],
  authors: [{ name: 'Lorenzo Signorelli' }],
  creator: 'Lorenzo Signorelli',
  publisher: 'Lorenzo Signorelli',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Lorenzo Signorelli',
    locale: 'en_US',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Lorenzo Signorelli portfolio social preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [defaultOgImage],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} overflow-y-auto no-scrollbar`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundEffect />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
