import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { getServiceFee } from '@/lib/fees'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ purchased: false })
  const { slug } = await params

  const post = await db.post.findUnique({ where: { slug }, select: { id: true } })
  if (!post) return NextResponse.json({ purchased: false })

  const purchase = await db.purchase.findFirst({
    where: { userId: session.user.id, postId: post.id, status: 'paid' },
  })
  return NextResponse.json({ purchased: !!purchase })
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login terlebih dahulu' }, { status: 401 })

  const { slug } = await params
  const { discountCode, refCode, payerName, payerWa } = await req.json().catch(() => ({}))

  const post = await db.post.findUnique({
    where: { slug },
    select: {
      id: true, isPremium: true, price: true, discount: true, authorId: true, type: true,
      author: { select: { bankName: true, bankAccount: true, bankHolder: true, qrisImage: true, waNumber: true } },
    },
  })
  if (!post) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
  if (!post.isPremium || !post.price)
    return NextResponse.json({ error: 'Artikel ini gratis' }, { status: 400 })
  if (post.authorId === session.user.id)
    return NextResponse.json({ error: 'Kamu adalah penulis artikel ini' }, { status: 400 })

  // Check already purchased (pending or paid)
  const existing = await db.purchase.findFirst({
    where: { userId: session.user.id, postId: post.id },
  })
  if (existing?.status === 'paid') return NextResponse.json({ purchased: true, alreadyOwned: true })
  if (existing?.status === 'pending') return NextResponse.json({
    pending: true,
    orderId: existing.orderId,
    paymentInfo: {
      bankName: post.author.bankName,
      bankAccount: post.author.bankAccount,
      bankHolder: post.author.bankHolder,
      qrisImage: post.author.qrisImage,
      waNumber: post.author.waNumber,
    },
  })

  // Apply article-level discount
  let finalAmount = post.price
  if (post.discount && post.discount > 0) {
    finalAmount = Math.round(post.price * (1 - post.discount / 100))
  }

  // Apply discount code
  let discount = null
  if (discountCode) {
    discount = await db.discount.findFirst({
      where: {
        code: discountCode.toUpperCase(),
        active: true,
        OR: [{ postId: post.id }, { postId: null }],
        AND: [
          { OR: [{ maxUses: null }, { usedCount: { lt: db.discount.fields.maxUses } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        ],
      },
    })
    if (!discount) return NextResponse.json({ error: 'Kode diskon tidak valid atau sudah habis' }, { status: 400 })

    if (discount.type === 'percent') {
      finalAmount = Math.round(finalAmount * (1 - discount.value / 100))
    } else {
      finalAmount = Math.max(0, finalAmount - discount.value)
    }
  }

  const serviceFee = getServiceFee(post.type)
  const totalAmount = finalAmount + serviceFee

  const purchase = await db.purchase.create({
    data: {
      userId: session.user.id,
      postId: post.id,
      amount: totalAmount,
      serviceFee,
      status: 'pending',
      orderId: randomUUID(),
      refCode: refCode ?? null,
      payerName: payerName ?? null,
      payerWa: payerWa ?? null,
    },
  })

  if (discount) {
    await db.discount.update({
      where: { id: discount.id },
      data: { usedCount: { increment: 1 } },
    })
  }

  return NextResponse.json({
    pending: true,
    orderId: purchase.orderId,
    amount: totalAmount,
    serviceFee,
    paymentInfo: {
      bankName: post.author.bankName,
      bankAccount: post.author.bankAccount,
      bankHolder: post.author.bankHolder,
      qrisImage: post.author.qrisImage,
      waNumber: post.author.waNumber,
    },
  })
}
