// Transaction fee per purchase (IDR) — paid by creator at withdrawal, not charged to buyer
export const TRANSACTION_FEE = 2500

// Service fee per post type (IDR). Legacy, kept for backwards compatibility
export const SERVICE_FEES: Record<string, number> = {
  markdown: 1000,
  html: 1000,
}

export function getServiceFee(postType: string): number {
  return SERVICE_FEES[postType] ?? 1000
}
