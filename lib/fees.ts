// Service fee per post type (IDR). Edit here to change rates.
export const SERVICE_FEES: Record<string, number> = {
  markdown: 1000,
  html: 1000,
}

export function getServiceFee(postType: string): number {
  return SERVICE_FEES[postType] ?? 1000
}
