import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

const TAKE = 12

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tab    = searchParams.get('tab') ?? 'terbaru'
  const type   = searchParams.get('type') ?? 'all'
  const cursor = searchParams.get('cursor') ?? undefined
  const session = await getServerSession(authOptions)

  const baseWhere = {
    published: true,
    isPrivate: false,
    ...(type !== 'all' ? { type } : {}),
  }

  let where = baseWhere as Record<string, unknown>

  if (tab === 'diikuti') {
    if (!session) return NextResponse.json({ posts: [], hasMore: false })
    where = {
      ...baseWhere,
      author: { followers: { some: { followerId: session.user.id } } },
    }
  }

  const orderBy =
    tab === 'trending'
      ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
      : { publishedAt: 'desc' as const }

  const posts = await db.post.findMany({
    where,
    orderBy,
    take: TAKE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, slug: true, title: true, description: true, type: true,
      category: true, coverImage: true, isPremium: true, price: true,
      viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
      author: { select: { username: true, name: true, profilePic: true } },
    },
  })

  const hasMore = posts.length > TAKE
  if (hasMore) posts.pop()

  return NextResponse.json({ posts, hasMore, nextCursor: posts[posts.length - 1]?.id ?? null })
}
