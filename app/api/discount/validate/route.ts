import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/discount/validate?code=XXX&slug=post-slug
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase()
  const slug = searchParams.get('slug')

  if (!code || !slug)
    return NextResponse.json({ error: 'code dan slug wajib diisi' }, { status: 400 })

  const post = await db.post.findUnique({
    where: { slug },
    select: { id: true, price: true, discount: true, isPremium: true },
  })
  if (!post || !post.isPremium || !post.price)
    return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 })

  const discount = await db.discount.findFirst({
    where: {
      code,
      active: true,
      OR: [{ postId: post.id }, { postId: null }],
      AND: [
        { OR: [{ maxUses: null }, { usedCount: { lt: db.discount.fields.maxUses } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      ],
    },
  })

  if (!discount)
    return NextResponse.json({ valid: false, error: 'Kode diskon tidak valid atau sudah habis' })

  // Apply article-level discount first
  let basePrice = post.price
  if (post.discount && post.discount > 0)
    basePrice = Math.round(post.price * (1 - post.discount / 100))

  // Apply voucher
  const finalPrice = discount.type === 'percent'
    ? Math.round(basePrice * (1 - discount.value / 100))
    : Math.max(0, basePrice - discount.value)

  return NextResponse.json({
    valid: true,
    type: discount.type,
    value: discount.value,
    basePrice,
    finalPrice,
    savings: basePrice - finalPrice,
  })
}
