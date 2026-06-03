import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { getMidtransServerKey, getMidtransBaseUrl } from '@/lib/midtrans'

// POST /api/midtrans/verify
// Dipanggil dari client setelah Snap onSuccess sebagai fallback (misal webhook belum tiba)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, orderType } = await req.json().catch(() => ({}))
  if (!orderId) return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 })

  // Fetch transaction status from Midtrans
  const res = await fetch(`${getMidtransBaseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: {
      Authorization: `Basic ${Buffer.from(getMidtransServerKey() + ':').toString('base64')}`,
    },
  })
  const data = await res.json() as Record<string, string>

  const { transaction_status, fraud_status, transaction_id } = data

  const isPaid =
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement'

  if (!isPaid) return NextResponse.json({ paid: false, status: transaction_status })

  // Update DB jika belum paid
  if (orderType === 'file' || orderId.startsWith('fp_')) {
    await db.filePurchase.updateMany({
      where: { orderId, userId: session.user.id, status: { not: 'paid' } },
      data: { status: 'paid', midtransId: transaction_id ?? null },
    })
  } else if (orderType === 'bundle' || orderId.startsWith('bp_')) {
    await db.bundlePurchase.updateMany({
      where: { orderId, userId: session.user.id, status: { not: 'paid' } },
      data: { status: 'paid', midtransId: transaction_id ?? null },
    })
  } else {
    await db.purchase.updateMany({
      where: { orderId, userId: session.user.id, status: { not: 'paid' } },
      data: { status: 'paid', midtransId: transaction_id ?? null },
    })
  }

  return NextResponse.json({ paid: true })
}
