// WA notification via Fonnte (https://fonnte.com)
// Set FONNTE_TOKEN in env to enable. If not set, notifications are silently skipped.
// Free tier: 1.000 msg/bulan. Daftar di https://app.fonnte.com

const FONNTE_TOKEN = process.env.FONNTE_TOKEN

/**
 * Send WA message via Fonnte.
 * waNumber: format 08xx or 628xx (will be normalized)
 */
async function sendWA(waNumber: string, message: string): Promise<void> {
  if (!FONNTE_TOKEN) return // WA disabled — no token configured

  // Normalize: strip leading 0, prefix 62
  const normalized = waNumber.replace(/^\+/, '').replace(/^0/, '62').replace(/\s+/g, '')

  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: FONNTE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: normalized, message, countryCode: '62' }),
    })
  } catch {
    // Fire-and-forget — never throw, never block the main flow
  }
}

const IDR = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`

// ── Notification events ──────────────────────────────────────────────

/** Notify creator: someone just bought their content */
export async function notifyCreatorNewOrder(opts: {
  creatorWa?: string | null
  creatorName: string
  buyerName: string
  contentTitle: string
  amount: number
  orderId: string
}) {
  if (!opts.creatorWa) return
  const msg =
    `💰 *Pesanan baru masuk!*\n\n` +
    `Halo ${opts.creatorName}!\n` +
    `*${opts.buyerName}* baru saja memesan:\n` +
    `📄 _${opts.contentTitle}_\n` +
    `💵 ${IDR(opts.amount)}\n\n` +
    `Order ID: \`${opts.orderId}\`\n\n` +
    `Segera cek dashboard untuk konfirmasi pembayaran:\n` +
    `https://xales.id/dashboard/orders`
  await sendWA(opts.creatorWa, msg)
}

/** Notify buyer: purchase has been confirmed, content is now accessible */
export async function notifyBuyerConfirmed(opts: {
  buyerWa?: string | null
  buyerName: string
  contentTitle: string
  contentUrl: string
}) {
  if (!opts.buyerWa) return
  const msg =
    `✅ *Pembayaranmu dikonfirmasi!*\n\n` +
    `Halo ${opts.buyerName}!\n` +
    `Akses ke konten berikut sudah aktif:\n` +
    `📄 *${opts.contentTitle}*\n\n` +
    `Klik link ini untuk membaca/mengakses:\n` +
    `${opts.contentUrl}\n\n` +
    `_Terima kasih sudah berbelanja di Tweak!_ 🎉`
  await sendWA(opts.buyerWa, msg)
}

/** Notify creator: withdrawal request submitted */
export async function notifyWithdrawalSubmitted(opts: {
  creatorWa?: string | null
  creatorName: string
  amount: number
}) {
  if (!opts.creatorWa) return
  const msg =
    `💸 *Permintaan pencairan diterima*\n\n` +
    `Halo ${opts.creatorName}!\n` +
    `Permintaan pencairan sebesar *${IDR(opts.amount)}* sedang diproses.\n\n` +
    `Estimasi: 1×24 jam kerja.\n` +
    `Cek status: https://xales.id/dashboard/earnings`
  await sendWA(opts.creatorWa, msg)
}

/** Notify creator: withdrawal approved/paid */
export async function notifyWithdrawalPaid(opts: {
  creatorWa?: string | null
  creatorName: string
  amount: number
}) {
  if (!opts.creatorWa) return
  const msg =
    `🎉 *Dana sudah ditransfer!*\n\n` +
    `Halo ${opts.creatorName}!\n` +
    `Pencairan sebesar *${IDR(opts.amount)}* sudah dikirim ke rekeningmu.\n\n` +
    `Cek riwayat: https://xales.id/dashboard/earnings`
  await sendWA(opts.creatorWa, msg)
}
