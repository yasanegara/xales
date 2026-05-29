import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const gifts = await db.giftItem.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { sentGifts: true } } },
  })
  return NextResponse.json(gifts)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { emoji, name, price } = await req.json()
  if (!emoji || !name || !price) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const maxOrder = await db.giftItem.aggregate({ _max: { order: true } })
  const gift = await db.giftItem.create({
    data: { emoji, name, price: parseInt(price), order: (maxOrder._max.order ?? 0) + 1 },
  })
  return NextResponse.json(gift, { status: 201 })
}
