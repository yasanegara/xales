import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'XALES — Creator Publishing Platform', template: '%s | XALES' },
  description: 'Publish articles and web apps. Monetize your creativity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://xales.id'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
