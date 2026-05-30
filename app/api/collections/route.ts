import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const collections = await db.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { items: true } } },
  })

  return NextResponse.json({ collections })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, emoji } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama folder wajib diisi' }, { status: 400 })

  const collection = await db.collection.create({
    data: { userId: session.user.id, name: name.trim(), emoji: emoji ?? '📁' },
    include: { _count: { select: { items: true } } },
  })

  return NextResponse.json({ collection }, { status: 201 })
}
