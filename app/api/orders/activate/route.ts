import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { notifyBuyerConfirmed } from '@/lib/notify'

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://xales.id'

// POST /api/orders/activate — creator activates a pending purchase
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, type } = await req.json()
  if (!orderId || !type) return NextResponse.json({ error: 'orderId and type required' }, { status: 400 })

  if (type === 'article') {
    const purchase = await db.purchase.findUnique({
      where: { orderId },
      include: {
        post: { select: { authorId: true, slug: true, title: true, author: { select: { username: true } } } },
        user: { select: { name: true, waNumber: true } },
      },
    })
    if (!purchase) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.post.authorId !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah aktif' }, { status: 400 })

    await db.purchase.update({ where: { orderId }, data: { status: 'paid' } })

    notifyBuyerConfirmed({
      buyerWa: purchase.payerWa ?? purchase.user?.waNumber,
      buyerName: purchase.payerName ?? purchase.user?.name ?? 'Pembeli',
      contentTitle: purchase.post.title,
      contentUrl: `${BASE}/@${purchase.post.author.username}/${purchase.post.slug}`,
    })

    return NextResponse.json({ ok: true })
  }

  if (type === 'file') {
    const purchase = await db.filePurchase.findUnique({
      where: { orderId },
      include: { file: { include: { post: { select: { authorId: true } } } } },
    })
    if (!purchase) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.file.post.authorId !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah aktif' }, { status: 400 })

    await db.filePurchase.update({
      where: { orderId },
      data: { status: 'paid' },
    })
    return NextResponse.json({ ok: true })
  }

  if (type === 'bundle') {
    const purchase = await db.bundlePurchase.findUnique({
      where: { orderId },
      include: { bundle: { select: { authorId: true } } },
    })
    if (!purchase) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (purchase.bundle.authorId !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (purchase.status === 'paid')
      return NextResponse.json({ error: 'Sudah aktif' }, { status: 400 })

    await db.bundlePurchase.update({ where: { orderId }, data: { status: 'paid' } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'type harus article, file, atau bundle' }, { status: 400 })
}
