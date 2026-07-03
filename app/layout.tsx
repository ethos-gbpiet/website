import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'EtHOS – Electronics and Hardware Oriented Society',
    template: '%s | EtHOS',
  },
  description:
    'The official website of EtHOS — the Electronics and Hardware Oriented Society of IET College. PCB design, embedded systems, power electronics, RF, and FPGA engineering.',
  keywords: ['EtHOS', 'electronics', 'hardware', 'PCB design', 'embedded systems', 'IET', 'college', 'engineering'],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fc' },
    { media: '(prefers-color-scheme: dark)', color: '#050c14' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
