// Simple in-memory rate limiter — no Redis needed for MVP
// Resets per server instance restart (sufficient for Railway single-instance)

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Returns true if request is allowed, false if rate-limited.
 * @param key    Unique key (e.g. `ip:endpoint`)
 * @param limit  Max requests per window
 * @param windowMs Window in ms (default 60s)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** Extract IP from Next.js request headers */
export function getIp(req: Request): string {
  const headers = new Headers((req as Request).headers)
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
