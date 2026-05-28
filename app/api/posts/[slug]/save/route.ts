import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ saved: false })
  const { slug } = await params
  const post = await db.post.findUnique({ where: { slug }, select: { id: true } })
  if (!post) return NextResponse.json({ saved: false })
  const entry = await db.savedPost.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
  })
  return NextResponse.json({ saved: !!entry })
}

export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const post = await db.post.findUnique({ where: { slug }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.savedPost.upsert({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
    create: { userId: session.user.id, postId: post.id },
    update: {},
  })
  return NextResponse.json({ saved: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const post = await db.post.findUnique({ where: { slug }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.savedPost.deleteMany({
    where: { userId: session.user.id, postId: post.id },
  })
  return NextResponse.json({ saved: false })
}
