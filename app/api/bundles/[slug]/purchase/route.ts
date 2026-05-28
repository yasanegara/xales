import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ slug: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login terlebih dahulu' }, { status: 401 })

  const { slug } = await params
  const { payerName, payerWa } = await req.json().catch(() => ({}))

  const bundle = await db.bundle.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, bankName: true, bankAccount: true, bankHolder: true, qrisImage: true, waNumber: true } },
    },
  })
  if (!bundle) return NextResponse.json({ error: 'Bundle tidak ditemukan' }, { status: 404 })
  if (bundle.author.id === session.user.id)
    return NextResponse.json({ error: 'Ini bundle milikmu sendiri' }, { status: 400 })

  const existing = await db.bundlePurchase.findUnique({
    where: { userId_bundleId: { userId: session.user.id, bundleId: bundle.id } },
  })
  if (existing?.status === 'paid') return NextResponse.json({ alreadyOwned: true })
  if (existing?.status === 'pending') return NextResponse.json({
    pending: true, orderId: existing.orderId,
    paymentInfo: {
      bankName: bundle.author.bankName, bankAccount: bundle.author.bankAccount,
      bankHolder: bundle.author.bankHolder, qrisImage: bundle.author.qrisImage,
      waNumber: bundle.author.waNumber,
    },
  })

  const finalAmount = bundle.discount
    ? Math.round(bundle.price * (1 - bundle.discount / 100))
    : bundle.price

  const purchase = await db.bundlePurchase.create({
    data: {
      userId: session.user.id,
      bundleId: bundle.id,
      amount: finalAmount,
      status: 'pending',
      orderId: randomUUID(),
      payerName: payerName ?? null,
      payerWa: payerWa ?? null,
    },
  })

  return NextResponse.json({
    pending: true,
    orderId: purchase.orderId,
    amount: finalAmount,
    paymentInfo: {
      bankName: bundle.author.bankName, bankAccount: bundle.author.bankAccount,
      bankHolder: bundle.author.bankHolder, qrisImage: bundle.author.qrisImage,
      waNumber: bundle.author.waNumber,
    },
  }, { status: 201 })
}
