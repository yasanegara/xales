import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans, Caveat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import TopLoader from '@/components/TopLoader'
import Footer from '@/components/Footer'

const midtransSnapUrl = process.env.MIDTRANS_ENV === 'production'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const midtransClientKey = process.env.MIDTRANS_ENV === 'production'
  ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PROD
  : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-brand' })
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-hand' })

export const metadata: Metadata = {
  title: { default: 'Tweak — Creator Publishing Platform', template: '%s | Tweak' },
  description: 'Publish articles and web apps. Monetize your creativity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'https://xales.id'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${caveat.variable}`}>
      <body>
        <Script
          src={midtransSnapUrl}
          data-client-key={midtransClientKey}
          strategy="lazyOnload"
        />
        <TopLoader />
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
