import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [user, totalReceived, totalSent, redemptions] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { giftBalance: true, giftRedeemed: true } }),
    // Total gift earnings sebagai kreator
    db.sentGift.aggregate({ where: { receiverId: userId }, _sum: { amount: true } }),
    // Total gift yang pernah dikirim sebagai pembaca
    db.sentGift.aggregate({ where: { senderId: userId }, _sum: { amount: true } }),
    // Riwayat redemption
    db.giftRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const giftEarnings   = totalReceived._sum.amount ?? 0
  const giftRedeemed   = user?.giftRedeemed ?? 0
  const availableGifts = Math.max(0, giftEarnings - giftRedeemed)

  return NextResponse.json({
    giftBalance:    user?.giftBalance ?? 0,
    giftEarnings,
    giftRedeemed,
    availableGifts,
    totalSent:      totalSent._sum.amount ?? 0,
    redemptions:    redemptions.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
  })
}
