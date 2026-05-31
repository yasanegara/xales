import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomUUID } from 'crypto'

type P = { params: Promise<{ id: string }> }

// POST: generate/toggle share link
export async function POST(_req: NextRequest, { params }: P) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const file = await db.driveFile.findUnique({ where: { id } })
  if (!file || file.userId !== session.user.id)
    return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  // Toggle: if already public, revoke; if not, generate token
  if (file.isPublic && file.shareToken) {
    const updated = await db.driveFile.update({
      where: { id },
      data: { isPublic: false, shareToken: null },
      select: { id: true, isPublic: true, shareToken: true },
    })
    return NextResponse.json({ file: updated, revoked: true })
  }

  const token = file.shareToken ?? randomUUID().replace(/-/g, '')
  const updated = await db.driveFile.update({
    where: { id },
    data: { isPublic: true, shareToken: token },
    select: { id: true, isPublic: true, shareToken: true },
  })
  return NextResponse.json({ file: updated, shareUrl: `/share/${token}` })
}
