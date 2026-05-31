import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

async function ownsFolder(userId: string, id: string) {
  const f = await db.driveFolder.findUnique({ where: { id } })
  return f?.userId === userId ? f : null
}

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const folder = await ownsFolder(session.user.id, id)
  if (!folder) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const { name, emoji, color, parentId } = await req.json()
  const updated = await db.driveFolder.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(emoji ? { emoji } : {}),
      ...(color ? { color } : {}),
      ...(parentId !== undefined ? { parentId } : {}),
    },
    select: { id: true, name: true, emoji: true, color: true, parentId: true },
  })
  return NextResponse.json({ folder: updated })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const folder = await ownsFolder(session.user.id, id)
  if (!folder) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  await db.driveFolder.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
