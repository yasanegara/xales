import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await db.post.findUnique({ where: { slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await db.like.findUnique({
    where: { postId_userId: { postId: post.id, userId: session.user.id } },
  })

  if (existing) {
    await db.like.delete({ where: { id: existing.id } })
    await db.post.update({ where: { id: post.id }, data: { likeCount: { decrement: 1 } } })
    return NextResponse.json({ liked: false })
  } else {
    await db.like.create({ data: { postId: post.id, userId: session.user.id } })
    await db.post.update({ where: { id: post.id }, data: { likeCount: { increment: 1 } } })
    return NextResponse.json({ liked: true })
  }
}

// GET — check if current user liked this post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ liked: false })

  const post = await db.post.findUnique({ where: { slug } })
  if (!post) return NextResponse.json({ liked: false })

  const like = await db.like.findUnique({
    where: { postId_userId: { postId: post.id, userId: session.user.id } },
  })

  return NextResponse.json({ liked: !!like })
}
