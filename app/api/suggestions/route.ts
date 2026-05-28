import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const limit = parseInt(new URL(req.url).searchParams.get('limit') ?? '6')

  // Users already followed (to exclude)
  const followingIds = session
    ? (await db.follow.findMany({ where: { followerId: session.user.id }, select: { followingId: true } }))
        .map((f) => f.followingId)
    : []

  const excludeIds = session ? [...followingIds, session.user.id] : []

  // My post data (categories, tags, type) for matching
  let myCategories: string[] = []
  let myTags: string[] = []
  let myTypes: string[] = []

  if (session) {
    const myPosts = await db.post.findMany({
      where: { authorId: session.user.id, published: true },
      select: { category: true, tags: true, type: true },
    })
    myCategories = myPosts.map((p) => p.category).filter(Boolean) as string[]
    myTags = myPosts.flatMap((p) => p.tags)
    myTypes = [...new Set(myPosts.map((p) => p.type))]
  }

  // Get candidates: users with published posts, not already followed
  const candidates = await db.user.findMany({
    where: {
      id: { notIn: excludeIds },
      posts: { some: { published: true } },
    },
    select: {
      id: true,
      username: true,
      name: true,
      profilePic: true,
      bio: true,
      status: true,
      _count: { select: { followers: true, posts: true } },
      posts: {
        where: { published: true },
        select: { category: true, tags: true, type: true },
        take: 20,
      },
    },
    take: 50,
  })

  // Score each candidate
  const scored = candidates.map((u) => {
    let score = 0

    const theirCategories = u.posts.map((p) => p.category).filter(Boolean) as string[]
    const theirTags = u.posts.flatMap((p) => p.tags)
    const theirTypes = [...new Set(u.posts.map((p) => p.type))]

    // Category overlap
    const catOverlap = myCategories.filter((c) =>
      theirCategories.some((tc) => tc.toLowerCase() === c.toLowerCase())
    ).length
    score += catOverlap * 3

    // Tag overlap
    const tagOverlap = myTags.filter((t) =>
      theirTags.some((tt) => tt.toLowerCase() === t.toLowerCase())
    ).length
    score += tagOverlap * 2

    // Type overlap (markdown vs html)
    const typeOverlap = myTypes.filter((t) => theirTypes.includes(t)).length
    score += typeOverlap * 1

    // Popularity boost (follower count)
    score += Math.min(5, Math.floor(u._count.followers / 5))

    // Post count boost
    score += Math.min(3, Math.floor(u._count.posts / 3))

    // If no session (guest), just sort by followers + posts
    if (!session) score = u._count.followers * 2 + u._count.posts

    return { ...u, score }
  })

  // Sort by score desc, then shuffle top tier slightly for variety
  scored.sort((a, b) => b.score - a.score)

  const results = scored.slice(0, limit).map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    profilePic: u.profilePic,
    bio: u.bio,
    status: u.status,
    followerCount: u._count.followers,
    postCount: u._count.posts,
    // Show the most common type
    primaryType: u.posts[0]?.type ?? 'markdown',
    topCategories: [...new Set(u.posts.map((p) => p.category).filter(Boolean))].slice(0, 3) as string[],
  }))

  return NextResponse.json({ suggestions: results })
}
