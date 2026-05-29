import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [sent, received] = await Promise.all([
    db.sentGift.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        receiver: { select: { username: true, name: true, profilePic: true } },
        giftItem: true,
        post: { select: { title: true, slug: true, author: { select: { username: true } } } },
      },
    }),
    db.sentGift.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: { select: { username: true, name: true, profilePic: true } },
        giftItem: true,
        post: { select: { title: true, slug: true } },
      },
    }),
  ])

  return NextResponse.json({
    sent:     sent.map(g => ({ ...g, createdAt: g.createdAt.toISOString() })),
    received: received.map(g => ({ ...g, createdAt: g.createdAt.toISOString() })),
  })
}
