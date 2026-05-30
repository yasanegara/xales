import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, emoji } = await req.json()

  const col = await db.collection.findUnique({ where: { id } })
  if (!col || col.userId !== session.user.id)
    return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })

  const updated = await db.collection.update({
    where: { id },
    data: { ...(name ? { name: name.trim() } : {}), ...(emoji ? { emoji } : {}) },
    include: { _count: { select: { items: true } } },
  })

  return NextResponse.json({ collection: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const col = await db.collection.findUnique({ where: { id } })
  if (!col || col.userId !== session.user.id)
    return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })

  await db.collection.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
