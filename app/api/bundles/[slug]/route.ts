import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const bundle = await db.bundle.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true, bankName: true, bankAccount: true, bankHolder: true, qrisImage: true, waNumber: true } },
      items: {
        include: {
          post: { select: { id: true, title: true, slug: true, type: true, description: true } },
          file: { select: { id: true, name: true, mimeType: true, url: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bundle)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const bundle = await db.bundle.findUnique({ where: { slug } })
  if (!bundle || bundle.authorId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, price, discount, published, items } = await req.json()

  // Replace all items
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } })

  const updated = await db.bundle.update({
    where: { slug },
    data: {
      title, description,
      price: price ? parseInt(price) : bundle.price,
      discount: discount !== undefined ? (discount ? parseInt(discount) : null) : bundle.discount,
      published: published ?? bundle.published,
      items: items?.length ? {
        create: items.map((item: { postId?: string; fileId?: string }, i: number) => ({
          postId: item.postId ?? null,
          fileId: item.fileId ?? null,
          order: i,
        })),
      } : undefined,
    },
    include: { items: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const bundle = await db.bundle.findUnique({ where: { slug } })
  if (!bundle || bundle.authorId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.bundle.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
