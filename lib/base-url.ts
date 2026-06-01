import { headers } from 'next/headers'

/**
 * Returns the base URL of the current request.
 * Uses x-forwarded-host (set by Railway's proxy) so it always reflects
 * the real public domain — never relies on NEXT_PUBLIC_APP_URL which is
 * baked in at build time and can be wrong when built locally.
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers()
    const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'xales.id'
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  } catch {
    // headers() throws when called outside a request (e.g. generateStaticParams at build time)
    return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://xales.id'
  }
}
