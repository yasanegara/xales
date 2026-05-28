import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true, profilePic: true, bio: true } },
      files: { select: { id: true, name: true, mimeType: true, size: true, isFree: true } },
    },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await db.post.findUnique({ where: { slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.authorId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { title, description, content, category, tags, published, isPremium, price, newFiles } = await req.json()

    const updated = await db.post.update({
      where: { slug },
      data: {
        title, description, content, category, tags,
        published,
        publishedAt: published && !post.publishedAt ? new Date() : post.publishedAt,
        isPremium: isPremium ?? post.isPremium,
        price: isPremium ? (price ?? null) : null,
        ...(newFiles?.length
          ? {
              files: {
                create: newFiles.map((f: { name: string; mimeType: string; size: number; data: string; isFree: boolean }) => ({
                  name: f.name, mimeType: f.mimeType, size: f.size, data: f.data, isFree: f.isFree,
                })),
              },
            }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await db.post.findUnique({ where: { slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.authorId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.post.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
