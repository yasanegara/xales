import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

// GET /api/orders — list all purchases for creator's content
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [articleOrders, fileOrders, bundleOrders] = await Promise.all([
    db.purchase.findMany({
      where: { post: { authorId: session.user.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        post: { select: { title: true, slug: true } },
        user: { select: { username: true, name: true, email: true } },
      },
    }),
    db.filePurchase.findMany({
      where: { file: { post: { authorId: session.user.id } } },
      orderBy: { createdAt: 'desc' },
      include: {
        file: {
          select: {
            name: true, mimeType: true,
            post: { select: { title: true, slug: true } },
          },
        },
        user: { select: { username: true, name: true, email: true } },
      },
    }),
    db.bundlePurchase.findMany({
      where: { bundle: { authorId: session.user.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        bundle: { select: { title: true, slug: true } },
        user: { select: { username: true, name: true, email: true } },
      },
    }),
  ])

  return NextResponse.json({ articleOrders, fileOrders, bundleOrders })
}
