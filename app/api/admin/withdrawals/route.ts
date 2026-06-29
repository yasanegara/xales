import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const withdrawals = await db.withdrawal.findMany({
    include: { user: { select: { username: true, name: true, email: true, waNumber: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(withdrawals)
}
