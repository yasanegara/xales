import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ username: string }> }

// GET — check if current user follows this username
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ following: false, followerCount: 0, followingCount: 0 })

  const { username } = await params
  const target = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      _count: { select: { followers: true, following: true } },
    },
  })
  if (!target) return NextResponse.json({ following: false, followerCount: 0, followingCount: 0 })

  const isFollowing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } },
  })

  return NextResponse.json({
    following: !!isFollowing,
    followerCount: target._count.followers,
    followingCount: target._count.following,
  })
}

// POST — follow
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const target = await db.user.findUnique({ where: { username }, select: { id: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.id === session.user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  await db.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } },
    create: { followerId: session.user.id, followingId: target.id },
    update: {},
  })

  return NextResponse.json({ following: true })
}

// DELETE — unfollow
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const target = await db.user.findUnique({ where: { username }, select: { id: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await db.follow.deleteMany({
    where: { followerId: session.user.id, followingId: target.id },
  })

  return NextResponse.json({ following: false })
}
