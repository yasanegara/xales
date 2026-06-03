import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/prisma'

import { getMidtransServerKey } from '@/lib/midtrans'

function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string) {
  const hash = createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${getMidtransServerKey()}`)
    .digest('hex')
  return hash === signatureKey
}

// POST /api/midtrans/notification — Midtrans payment status webhook
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const {
    order_id: orderId,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    transaction_id,
  } = body as Record<string, string>

  if (!verifySignature(orderId, status_code, gross_amount, signature_key)) {
    console.error('[midtrans/notification] invalid signature for order', orderId)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const isPaid =
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement'

  const isFailed =
    transaction_status === 'cancel' ||
    transaction_status === 'deny' ||
    transaction_status === 'expire'

  if (!isPaid && !isFailed) {
    return NextResponse.json({ ok: true })
  }

  const newStatus = isPaid ? 'paid' : 'failed'

  // orderId prefix tells us the table: fp_ = file, bp_ = bundle, else = article
  if (orderId.startsWith('fp_')) {
    await db.filePurchase.updateMany({
      where: { orderId, status: { not: 'paid' } },
      data: { status: newStatus, midtransId: transaction_id ?? null },
    })
  } else if (orderId.startsWith('bp_')) {
    await db.bundlePurchase.updateMany({
      where: { orderId, status: { not: 'paid' } },
      data: { status: newStatus, midtransId: transaction_id ?? null },
    })
  } else {
    await db.purchase.updateMany({
      where: { orderId, status: { not: 'paid' } },
      data: { status: newStatus, midtransId: transaction_id ?? null },
    })
  }

  return NextResponse.json({ ok: true })
}
