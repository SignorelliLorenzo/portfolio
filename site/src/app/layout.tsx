import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { BackgroundEffect } from '@/components/effects/background-effect'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lorenzo Signorelli',
  description: 'My portfolio website',
  icons: {
    icon: '/favicon.ico',
  }
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
