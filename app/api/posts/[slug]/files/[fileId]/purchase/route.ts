import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string; fileId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { slug, fileId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const file = await db.postFile.findUnique({
    where: { id: fileId },
    include: { post: { select: { slug: true, authorId: true } } },
  })

  if (!file || file.post.slug !== slug)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })

  if (!file.price || file.isFree)
    return NextResponse.json({ error: 'File cannot be bought separately' }, { status: 400 })

  // Check if already purchased
  const existing = await db.filePurchase.findUnique({
    where: { userId_fileId: { userId: session.user.id, fileId } },
  })
  if (existing) return NextResponse.json({ ok: true, message: 'Already purchased' })

  try {
    const { discountCode } = await req.json()
    let finalPrice = file.price

    // Apply file discount
    if (file.discount && file.discount > 0)
      finalPrice = Math.round(file.price * (1 - file.discount / 100))

    // Apply discount code (if provided)
    if (discountCode) {
      const dc = await db.discount.findUnique({ where: { code: discountCode } })
      if (dc && dc.active) {
        const discountAmount = dc.type === 'percent'
          ? Math.round(finalPrice * (dc.value / 100))
          : dc.value
        finalPrice = Math.max(0, finalPrice - discountAmount)
      }
    }

    // Demo mode: instant payment
    const orderId = `fp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const purchase = await db.filePurchase.create({
      data: {
        userId: session.user.id,
        fileId,
        amount: finalPrice,
        status: 'paid',
        orderId,
      },
    })

    // Calculate and record affiliate commission if applicable
    const author = await db.user.findUnique({ where: { id: file.post.authorId } })
    if (author && author.affiliateRate && author.affiliateRate > 0) {
      const commission = Math.round(finalPrice * (author.affiliateRate / 100))
      if (commission > 0) {
        // Store commission info in post purchase (or create separate commission log)
        // For now, just log it conceptually
        console.log(`Commission: ${commission} to @${author.username}`)
      }
    }

    return NextResponse.json(purchase, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
