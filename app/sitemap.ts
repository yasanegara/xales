import { MetadataRoute } from 'next'
import { db } from '@/lib/prisma'

const BASE = 'https://xales.id'

export const revalidate = 3600 // rebuild sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; author: { username: string }; updatedAt: Date }[] = []
  let users: { username: string; updatedAt: Date }[] = []

  try {
    ;[posts, users] = await Promise.all([
      db.post.findMany({
        where: { published: true, isPrivate: false },
        select: { slug: true, author: { select: { username: true } }, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 5000,
      }),
      db.user.findMany({
        where: { posts: { some: { published: true, isPrivate: false } } },
        select: { username: true, updatedAt: true },
        take: 2000,
      }),
    ])
  } catch {
    // DB unreachable at build time — return static routes only
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/produk`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/@${p.author.username}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const profileRoutes: MetadataRoute.Sitemap = users.map(u => ({
    url: `${BASE}/@${u.username}`,
    lastModified: u.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes, ...profileRoutes]
}
