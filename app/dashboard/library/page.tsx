export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import LibraryClient from './LibraryClient'

export const metadata = { title: 'Library · Tweak' }

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  const userId  = session!.user.id

  const [articlePurchases, filePurchases, bundlePurchases, savedPosts, collections] = await Promise.all([
    db.purchase.findMany({
      where: { userId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, createdAt: true,
        post: { select: { slug: true, title: true, description: true, type: true, author: { select: { username: true, name: true } } } },
      },
    }),
    db.filePurchase.findMany({
      where: { userId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, createdAt: true,
        file: { select: { id: true, name: true, url: true, mimeType: true, post: { select: { slug: true, title: true, author: { select: { username: true, name: true } } } } } },
      },
    }),
    db.bundlePurchase.findMany({
      where: { userId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, createdAt: true,
        bundle: { select: { slug: true, title: true, description: true, author: { select: { username: true, name: true } } } },
      },
    }),
    db.savedPost.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      select: {
        id: true, savedAt: true,
        post: { select: { id: true, slug: true, title: true, description: true, type: true, viewCount: true, likeCount: true, author: { select: { username: true, name: true } } } },
      },
    }),
    db.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        items: true,
        _count: { select: { items: true } },
      },
    }),
  ])

  return (
    <LibraryClient
      articlePurchases={articlePurchases.map(p => ({
        id: p.id, amount: p.amount, createdAt: p.createdAt.toISOString(),
        post: p.post,
      }))}
      filePurchases={filePurchases.map(p => ({
        id: p.id, amount: p.amount, createdAt: p.createdAt.toISOString(),
        file: p.file,
      }))}
      bundlePurchases={bundlePurchases.map(p => ({
        id: p.id, amount: p.amount, createdAt: p.createdAt.toISOString(),
        bundle: p.bundle,
      }))}
      savedPosts={savedPosts.map(p => ({
        id: p.id, savedAt: p.savedAt.toISOString(),
        post: p.post,
      }))}
      collections={collections.map(c => ({
        id: c.id, name: c.name, emoji: c.emoji,
        count: c._count.items,
        itemIds: c.items.map(i => ({ itemType: i.itemType, itemId: i.itemId })),
      }))}
    />
  )
}
