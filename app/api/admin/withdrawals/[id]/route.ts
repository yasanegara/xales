import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { status, adminNote } = await req.json()

  if (!['approved', 'paid', 'rejected'].includes(status))
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })

  const withdrawal = await db.withdrawal.update({
    where: { id },
    data: { status, adminNote: adminNote ?? undefined },
  })

  return NextResponse.json(withdrawal)
}
