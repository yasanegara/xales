import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ slug: string }> }

// GET — check if current user has purchased
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

// POST — create purchase (demo mode: instantly marks as paid)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login terlebih dahulu' }, { status: 401 })

  const { slug } = await params
  const { discountCode, refCode } = await req.json().catch(() => ({}))

  const post = await db.post.findUnique({
    where: { slug },
    select: { id: true, isPremium: true, price: true, authorId: true },
  })
  if (!post) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
  if (!post.isPremium || !post.price)
    return NextResponse.json({ error: 'Artikel ini gratis' }, { status: 400 })
  if (post.authorId === session.user.id)
    return NextResponse.json({ error: 'Kamu adalah penulis artikel ini' }, { status: 400 })

  // Check already purchased
  const existing = await db.purchase.findFirst({
    where: { userId: session.user.id, postId: post.id, status: 'paid' },
  })
  if (existing) return NextResponse.json({ purchased: true, alreadyOwned: true })

  // Apply discount code
  let finalAmount = post.price
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
      finalAmount = Math.round(post.price * (1 - discount.value / 100))
    } else {
      finalAmount = Math.max(0, post.price - discount.value)
    }
  }

  // Create purchase (demo: immediately paid)
  const purchase = await db.purchase.create({
    data: {
      userId: session.user.id,
      postId: post.id,
      amount: finalAmount,
      status: 'paid',  // demo mode — no real payment gateway yet
      orderId: randomUUID(),
      refCode: refCode ?? null,
    },
  })

  // Increment discount usage
  if (discount) {
    await db.discount.update({
      where: { id: discount.id },
      data: { usedCount: { increment: 1 } },
    })
  }

  return NextResponse.json({ purchased: true, purchase })
}
