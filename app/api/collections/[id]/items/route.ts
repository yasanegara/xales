import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

// Add item to collection
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { itemType, itemId } = await req.json()

  if (!itemType || !itemId)
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const col = await db.collection.findUnique({ where: { id } })
  if (!col || col.userId !== session.user.id)
    return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })

  const item = await db.collectionItem.upsert({
    where: { collectionId_itemType_itemId: { collectionId: id, itemType, itemId } },
    create: { collectionId: id, itemType, itemId },
    update: {},
  })

  return NextResponse.json({ item }, { status: 201 })
}

// Remove item from collection
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { itemType, itemId } = await req.json()

  const col = await db.collection.findUnique({ where: { id } })
  if (!col || col.userId !== session.user.id)
    return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })

  await db.collectionItem.deleteMany({
    where: { collectionId: id, itemType, itemId },
  })

  return NextResponse.json({ success: true })
}
