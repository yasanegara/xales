import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET() {
  const gifts = await db.giftItem.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(gifts)
}
