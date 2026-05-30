import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { notifyWithdrawalPaid } from '@/lib/notify'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { status, adminNote } = await req.json()

  if (!['approved', 'paid', 'rejected'].includes(status))
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })

  const withdrawal = await db.withdrawal.findUnique({ where: { id }, include: { user: { select: { name: true, waNumber: true } } } })
  if (!withdrawal) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const updated = await db.withdrawal.update({
    where: { id },
    data: { status, adminNote: adminNote ?? undefined },
  })

  if (status === 'paid') {
    notifyWithdrawalPaid({
      creatorWa: withdrawal.user.waNumber,
      creatorName: withdrawal.user.name ?? 'Kreator',
      amount: withdrawal.amount,
    })
  }

  return NextResponse.json(updated)
}
