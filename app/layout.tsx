import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans, Caveat } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import TopLoader from '@/components/TopLoader'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-brand' })
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-hand' })

export const metadata: Metadata = {
  title: { default: 'tweak — Creator Publishing Platform', template: '%s | tweak' },
  description: 'Publish articles and web apps. Monetize your creativity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://tweak.id'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${caveat.variable}`}>
      <body>
        <TopLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
