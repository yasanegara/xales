import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      status: true,
      profilePic: true,
      affiliateRate: true,
      bankName: true,
      bankAccount: true,
      bankHolder: true,
      waNumber: true,
      waMessage: true,
      createdAt: true,
      posts: {
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          type: true,
          category: true,
          tags: true,
          viewCount: true,
          likeCount: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const totalViews = user.posts.reduce((sum, p) => sum + p.viewCount, 0)
  const totalLikes = user.posts.reduce((sum, p) => sum + p.likeCount, 0)

  return NextResponse.json({ ...user, totalViews, totalLikes })
}
