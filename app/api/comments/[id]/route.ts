import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const comment = await db.comment.findUnique({
    where: { id },
    include: { post: { select: { authorId: true } } },
  })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Allow: comment owner OR post author OR admin
  const isOwner  = comment.userId === session.user.id
  const isPostAuthor = comment.post.authorId === session.user.id
  const isAdmin  = session.user.role === 'admin'
  if (!isOwner && !isPostAuthor && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.comment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
