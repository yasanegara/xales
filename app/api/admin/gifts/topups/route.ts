import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const topups = await db.giftTopUp.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { username: true, name: true, email: true } } },
  })

  return NextResponse.json({ topups })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { topupId, action } = await req.json() // action: 'confirm' | 'reject'
  if (!topupId || !['confirm', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const topup = await db.giftTopUp.findUnique({ where: { id: topupId } })
  if (!topup || topup.status !== 'pending') {
    return NextResponse.json({ error: 'Top-up tidak ditemukan atau sudah diproses' }, { status: 400 })
  }

  if (action === 'confirm') {
    await db.$transaction([
      db.giftTopUp.update({ where: { id: topupId }, data: { status: 'confirmed' } }),
      db.user.update({ where: { id: topup.userId }, data: { giftBalance: { increment: topup.amount } } }),
    ])
  } else {
    await db.giftTopUp.update({ where: { id: topupId }, data: { status: 'rejected' } })
  }

  return NextResponse.json({ success: true })
}
