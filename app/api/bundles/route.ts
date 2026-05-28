import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

// GET: list creator's bundles
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundles = await db.bundle.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          post: { select: { id: true, title: true, slug: true, type: true } },
          file: { select: { id: true, name: true, mimeType: true } },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { purchases: true } },
    },
  })

  return NextResponse.json(bundles)
}

// POST: create bundle
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, price, discount, items } = await req.json()
  if (!title || !price || !items?.length)
    return NextResponse.json({ error: 'Title, harga, dan item wajib diisi' }, { status: 400 })

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const bundle = await db.bundle.create({
    data: {
      slug, title, description, price: parseInt(price),
      discount: discount ? parseInt(discount) : null,
      authorId: session.user.id,
      items: {
        create: items.map((item: { postId?: string; fileId?: string }, i: number) => ({
          postId: item.postId ?? null,
          fileId: item.fileId ?? null,
          order: i,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json(bundle, { status: 201 })
}
