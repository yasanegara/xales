import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount < 10000) return NextResponse.json({ error: 'Minimum pencairan gift Rp 10.000' }, { status: 400 })

  const userId = session.user.id

  // Hitung available gift earnings
  const [totalReceived, user] = await Promise.all([
    db.sentGift.aggregate({ where: { receiverId: userId }, _sum: { amount: true } }),
    db.user.findUnique({ where: { id: userId }, select: { giftRedeemed: true } }),
  ])

  const giftEarnings   = totalReceived._sum.amount ?? 0
  const giftRedeemed   = user?.giftRedeemed ?? 0
  const availableGifts = Math.max(0, giftEarnings - giftRedeemed)

  if (amount > availableGifts) {
    return NextResponse.json({ error: `Saldo gift tidak cukup. Tersedia: Rp ${availableGifts.toLocaleString('id-ID')}` }, { status: 400 })
  }

  // Buat redemption request dan update giftRedeemed
  const [redemption] = await db.$transaction([
    db.giftRedemption.create({
      data: { userId, amount, status: 'pending' },
    }),
    db.user.update({
      where: { id: userId },
      data: { giftRedeemed: { increment: amount } },
    }),
  ])

  return NextResponse.json({ redemption, message: 'Permintaan pencairan gift berhasil!' }, { status: 201 })
}
