import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { emoji, name, price, isActive } = await req.json()
  const gift = await db.giftItem.update({
    where: { id },
    data: { ...(emoji !== undefined && { emoji }), ...(name !== undefined && { name }), ...(price !== undefined && { price: parseInt(price) }), ...(isActive !== undefined && { isActive }) },
  })
  return NextResponse.json(gift)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.giftItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
