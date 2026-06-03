import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { createSnapToken, MidtransOrderType } from '@/lib/midtrans'

// POST /api/midtrans/token
// Body: { orderId, orderType: 'article' | 'file' | 'bundle' }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, orderType } = await req.json().catch(() => ({}))
  if (!orderId || !orderType)
    return NextResponse.json({ error: 'orderId dan orderType wajib diisi' }, { status: 400 })

  // Fetch order depending on type
  let amount = 0
  let itemName = ''

  if (orderType === 'article') {
    const purchase = await db.purchase.findUnique({
      where: { orderId },
      include: { post: { select: { title: true } } },
    })
    if (!purchase || purchase.userId !== session.user.id)
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah dibayar' }, { status: 400 })
    amount = purchase.amount
    itemName = purchase.post.title
  } else if (orderType === 'file') {
    const purchase = await db.filePurchase.findUnique({
      where: { orderId },
      include: { file: { select: { name: true } } },
    })
    if (!purchase || purchase.userId !== session.user.id)
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah dibayar' }, { status: 400 })
    amount = purchase.amount
    itemName = purchase.file.name
  } else if (orderType === 'bundle') {
    const purchase = await db.bundlePurchase.findUnique({
      where: { orderId },
      include: { bundle: { select: { title: true } } },
    })
    if (!purchase || purchase.userId !== session.user.id)
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah dibayar' }, { status: 400 })
    amount = purchase.amount
    itemName = purchase.bundle.title
  } else {
    return NextResponse.json({ error: 'orderType tidak valid' }, { status: 400 })
  }

  try {
    const { token, redirectUrl } = await createSnapToken({
      orderId,
      amount,
      itemName,
      buyerName: session.user.name ?? 'Pembeli',
      buyerEmail: session.user.email ?? '',
      orderType: orderType as MidtransOrderType,
    })

    return NextResponse.json({ token, redirectUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    const key = process.env.MIDTRANS_SERVER_KEY_PROD ?? '(tidak ada)'
    console.error('[midtrans/token] error:', message)
    console.error('[midtrans/token] ENV:', process.env.MIDTRANS_ENV)
    console.error('[midtrans/token] KEY (preview):', key.slice(0, 10) + '...' + key.slice(-4))
    return NextResponse.json({ error: 'Gagal membuat token pembayaran', detail: message }, { status: 500 })
  }
}
