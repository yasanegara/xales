import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileId } = await params
  const file = await db.postFile.findUnique({
    where: { id: fileId },
    include: { post: { select: { authorId: true } } },
  })
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (file.post.authorId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.postFile.delete({ where: { id: fileId } })
  return NextResponse.json({ ok: true })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await getServerSession(authOptions)
  const { fileId } = await params

  const file = await db.postFile.findUnique({
    where: { id: fileId },
    include: {
      post: { select: { authorId: true, isPremium: true, published: true } },
    },
  })
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!file.post.published) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Paid file — require purchase
  if (!file.isFree) {
    if (!session) return NextResponse.json({ error: 'Login untuk mengunduh' }, { status: 401 })
    const isAuthor = file.post.authorId === session.user.id
    if (!isAuthor) {
      const purchase = await db.purchase.findFirst({
        where: { userId: session.user.id, postId: file.postId, status: 'paid' },
      })
      if (!purchase) return NextResponse.json({ error: 'Perlu membeli artikel ini terlebih dahulu' }, { status: 403 })
    }
  }

  // Decode base64 and stream as file download
  const buffer = Buffer.from(file.data, 'base64')
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': String(buffer.length),
    },
  })
}
