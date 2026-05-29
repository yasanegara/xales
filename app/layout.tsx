import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Syne } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import TopLoader from '@/components/TopLoader'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
const syne = Syne({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-brand' })

export const metadata: Metadata = {
  title: { default: 'tweak — Creator Publishing Platform', template: '%s | tweak' },
  description: 'Publish articles and web apps. Monetize your creativity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://tweak.id'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} ${jetbrainsMono.variable} ${syne.variable}`}>
      <body>
        <TopLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
