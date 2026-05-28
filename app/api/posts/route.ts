import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const sort = searchParams.get('sort') ?? 'latest'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where = { published: true, ...(type ? { type } : {}) }
  const orderBy =
    sort === 'trending'
      ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
      : { publishedAt: 'desc' as const }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where, orderBy,
      skip: (page - 1) * limit, take: limit,
      include: { author: { select: { username: true, name: true, profilePic: true } } },
    }),
    db.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, description, type, content, category, tags, published, isPremium, price, discount, files } = await req.json()

    if (!title || !type || !content)
      return NextResponse.json({ error: 'Title, type, dan content wajib diisi' }, { status: 400 })

    const slug = await generateUniqueSlug(title)

    const post = await db.post.create({
      data: {
        slug, title, description, type, content, category,
        tags: tags ?? [],
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        isPremium: isPremium ?? false,
        price: isPremium ? (price ?? null) : null,
        discount: isPremium ? (discount ?? null) : null,
        authorId: session.user.id,
        ...(files?.length
          ? {
              files: {
                create: files.map((f: any) => ({
                  name: f.name,
                  mimeType: f.mimeType,
                  size: f.size,
                  data: f.data ?? null,
                  url: f.url ?? null,
                  isFree: f.isFree,
                  price: f.price ?? null,
                  discount: f.discount ?? null,
                })),
              },
            }
          : {}),
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
