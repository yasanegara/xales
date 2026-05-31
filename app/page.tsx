export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { unstable_cache } from 'next/cache'
import FeedSection from '@/components/feed/FeedSection'
import CreatorAvatars from '@/components/CreatorAvatars'
import Link from 'next/link'

interface SearchParams { tab?: string; type?: string; tag?: string }

const TAKE = 12

// Cache static data for 5 minutes — tags, creators, counts rarely change
const getCachedSiteData = unstable_cache(
  async () => {
    const [tagRows, recentCreators, totalUsers] = await Promise.all([
      // Only fetch top 300 posts for tag counting — enough for accuracy
      db.post.findMany({
        where: { published: true, isPrivate: false },
        select: { tags: true },
        orderBy: { viewCount: 'desc' },
        take: 300,
      }),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 18,
        select: { username: true, name: true, profilePic: true,
          _count: { select: { posts: { where: { published: true } } } } },
      }),
      db.user.count(),
    ])

    const tagCount: Record<string, number> = {}
    for (const p of tagRows) {
      for (const t of p.tags) {
        if (t) tagCount[t] = (tagCount[t] ?? 0) + 1
      }
    }
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([t]) => t)

    return { topTags, recentCreators, totalUsers }
  },
  ['homepage-static'],
  { revalidate: 300 } // 5 minutes
)

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp      = await searchParams
  const tab     = sp.tab  ?? 'terbaru'
  const type    = sp.type ?? 'all'
  const tag     = sp.tag  ?? ''

  // Run session + initial posts + cached static data in parallel
  const [session, { topTags, recentCreators, totalUsers }, rawPosts] = await Promise.all([
    getServerSession(authOptions),
    getCachedSiteData(),
    db.post.findMany({
      where: {
        published: true, isPrivate: false,
        ...(type !== 'all' ? { type } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: tab === 'trending'
        ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
        : { publishedAt: 'desc' as const },
      take: TAKE + 1,
      select: {
        id: true, slug: true, title: true, description: true, type: true,
        category: true, coverImage: true, isPremium: true, price: true,
        viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
        author: { select: { username: true, name: true, profilePic: true } },
      },
    }),
  ])

  const hasMore    = rawPosts.length > TAKE
  const posts      = hasMore ? rawPosts.slice(0, TAKE) : rawPosts
  const nextCursor = posts[posts.length - 1]?.id ?? null

  return (
    <>
      <Navbar />

      {/* Hero — only for logged-out users */}
      {!session && (
        <div style={{ borderBottom: '1px solid #e5e0d8', background: '#ffffff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-hero">
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#1a1a1a', lineHeight: 1.1, marginBottom: '1.25rem' }}>
              Karya kamu layak<br />menghasilkan uang.
            </h1>
            <p style={{ color: '#6e6a65', fontSize: 'clamp(1rem, 2vw, 1.1875rem)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto 2rem' }}>
              Platform untuk kreator Indonesia — tulis artikel, publish tools, dan monetisasi karya langsung dari satu tempat.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ background: '#1a1a1a', color: '#ffffff', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Mulai gratis</Link>
              <Link href="/login" style={{ background: '#ffffff', color: '#1a1a1a', padding: '0.75rem 2rem', borderRadius: '8px', border: '1px solid #e5e0d8', textDecoration: 'none', fontSize: '0.9375rem' }}>Masuk</Link>
            </div>
          </div>
        </div>
      )}

      {/* Creator showcase */}
      <div style={{ borderBottom: '1px solid #e5e0d8', background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-showcase">
          <CreatorAvatars creators={recentCreators} totalUsers={totalUsers} session={!!session} />
        </div>
      </div>

      {/* Feed — client-side filters, no page reload */}
      <FeedSection
        initialPosts={posts as any}
        initialHasMore={hasMore}
        initialCursor={nextCursor}
        initialTab={tab}
        initialType={type}
        initialTag={tag}
        topTags={topTags}
        hasSession={!!session}
      />

      {/* CTA join banner */}
      {!session && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
          <div className="home-cta">
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.2 }}>Siap jadi kreator?</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Bergabung dengan {totalUsers.toLocaleString('id-ID')} kreator yang sudah publish di Tweak. Gratis selamanya.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ background: '#ffffff', color: '#1a1a1a', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 700 }}>Daftar gratis</Link>
              <Link href="/login" style={{ background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '0.75rem 2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '0.9375rem' }}>Sudah punya akun</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
