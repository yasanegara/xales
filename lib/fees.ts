import { db } from '@/lib/prisma'

// Fallback values used when DB has no config yet
const DEFAULTS = {
  service_fee_article:  1000,   // IDR — biaya layanan untuk artikel
  service_fee_app:      1000,   // IDR — biaya layanan untuk app/HTML
  transaction_fee:      2500,   // IDR — dipotong dari kreator saat withdraw
}

// Simple in-memory cache (TTL 5 min) so every purchase doesn't hit the DB
let cache: typeof DEFAULTS | null = null
let cacheAt = 0
const CACHE_TTL = 5 * 60 * 1000

async function loadFees(): Promise<typeof DEFAULTS> {
  if (cache && Date.now() - cacheAt < CACHE_TTL) return cache

  try {
    const rows = await db.config.findMany({
      where: { key: { in: Object.keys(DEFAULTS) } },
    })
    const map = Object.fromEntries(rows.map(r => [r.key, parseInt(r.value)]))
    cache = {
      service_fee_article: map.service_fee_article  ?? DEFAULTS.service_fee_article,
      service_fee_app:     map.service_fee_app      ?? DEFAULTS.service_fee_app,
      transaction_fee:     map.transaction_fee      ?? DEFAULTS.transaction_fee,
    }
    cacheAt = Date.now()
    return cache
  } catch {
    return DEFAULTS
  }
}

export async function getServiceFee(postType: string): Promise<number> {
  const fees = await loadFees()
  return postType === 'html' ? fees.service_fee_app : fees.service_fee_article
}

export async function getTransactionFee(): Promise<number> {
  const fees = await loadFees()
  return fees.transaction_fee
}

// Admin: update a fee value and bust cache
export async function setFee(key: keyof typeof DEFAULTS, value: number): Promise<void> {
  await db.config.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  })
  cache = null // bust cache
}

export async function getAllFees(): Promise<typeof DEFAULTS> {
  cache = null // force fresh read for admin
  return loadFees()
}

// Legacy sync export — kept so existing imports don't break
export const TRANSACTION_FEE = DEFAULTS.transaction_fee
export const SERVICE_FEES: Record<string, number> = {
  markdown: DEFAULTS.service_fee_article,
  html:     DEFAULTS.service_fee_app,
}
