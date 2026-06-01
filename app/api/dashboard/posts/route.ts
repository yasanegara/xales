import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const posts = await db.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, type: true,
      published: true, isPrivate: true, isPremium: true, price: true,
      viewCount: true, likeCount: true, createdAt: true, updatedAt: true,
      // intentionally exclude: content, coverImage (large @db.Text fields)
    },
  })

  return NextResponse.json({ posts })
}
