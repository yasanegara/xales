import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/utils'

// GET /api/posts — public feed
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'markdown' | 'html' | null
  const sort = searchParams.get('sort') ?? 'latest' // 'latest' | 'trending'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where = {
    published: true,
    ...(type ? { type } : {}),
  }

  const orderBy =
    sort === 'trending'
      ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
      : { publishedAt: 'desc' as const }

  const posts = await db.post.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      author: { select: { username: true, name: true, profilePic: true } },
    },
  })

  const total = await db.post.count({ where })

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/posts — create post (authenticated)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, description, type, content, category, tags, published } = await req.json()

    if (!title || !type || !content) {
      return NextResponse.json({ error: 'Title, type, dan content wajib diisi' }, { status: 400 })
    }

    const slug = await generateUniqueSlug(title)

    const post = await db.post.create({
      data: {
        slug,
        title,
        description,
        type,
        content,
        category,
        tags: tags ?? [],
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
