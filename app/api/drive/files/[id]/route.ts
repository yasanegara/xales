import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

async function ownsFile(userId: string, id: string) {
  const f = await db.driveFile.findUnique({ where: { id } })
  return f?.userId === userId ? f : null
}

export async function GET(_req: NextRequest, { params }: P) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const file = await db.driveFile.findUnique({ where: { id } })
  if (!file) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  if (!file.isPublic && file.userId !== session?.user?.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Serve file data
  if (file.data) {
    const buf = Buffer.from(file.data, 'base64')
    return new NextResponse(buf, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': String(buf.length),
      },
    })
  }
  if (file.url) return NextResponse.redirect(file.url)
  return NextResponse.json({ error: 'File tidak memiliki konten' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const file = await ownsFile(session.user.id, id)
  if (!file) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const { name, folderId, isPublic } = await req.json()
  const updated = await db.driveFile.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(folderId !== undefined ? { folderId } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
    },
    select: { id: true, name: true, mimeType: true, size: true, url: true, isPublic: true, shareToken: true, folderId: true },
  })
  return NextResponse.json({ file: updated })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const file = await ownsFile(session.user.id, id)
  if (!file) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  await db.driveFile.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
