export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FeedGrid from '@/components/feed/FeedGrid'
import Link from 'next/link'

interface SearchParams { tab?: string; type?: string; tag?: string }

const TAKE = 12

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp      = await searchParams
  const tab     = sp.tab  ?? 'terbaru'
  const type    = sp.type ?? 'all'
  const tag     = sp.tag  ?? ''
  const session = await getServerSession(authOptions)

  const baseWhere = {
    published: true,
    isPrivate: false,
    ...(type !== 'all' ? { type } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  }

  let where = baseWhere as Record<string, unknown>
  if (tab === 'diikuti' && session) {
    where = { ...baseWhere, author: { followers: { some: { followerId: session.user.id } } } }
  }

  const orderBy = tab === 'trending'
    ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
    : { publishedAt: 'desc' as const }

  // Fetch posts, tags, and recent creators in parallel
  const [rawPosts, tagRows, recentCreators, totalUsers, totalPosts] = await Promise.all([
    db.post.findMany({
      where, orderBy,
      take: TAKE + 1,
      select: {
        id: true, slug: true, title: true, description: true, type: true,
        category: true, coverImage: true, isPremium: true, price: true,
        viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
        author: { select: { username: true, name: true, profilePic: true } },
      },
    }),
    db.post.findMany({
      where: { published: true, isPrivate: false, ...(type !== 'all' ? { type } : {}) },
      select: { tags: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 18,
      select: { username: true, name: true, profilePic: true, _count: { select: { posts: { where: { published: true } } } } },
    }),
    db.user.count(),
    db.post.count({ where: { published: true, isPrivate: false } }),
  ])

  // Collect + count tags, sort by frequency
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

  const hasMore    = rawPosts.length > TAKE
  const posts      = hasMore ? rawPosts.slice(0, TAKE) : rawPosts
  const nextCursor = posts[posts.length - 1]?.id ?? null

  const tabs = [
    { key: 'terbaru',  label: 'Terbaru' },
    { key: 'trending', label: 'Trending' },
    { key: 'diikuti',  label: 'Diikuti', needsAuth: true },
  ]
  const typeLinks = [
    { value: 'all',      label: 'Semua' },
    { value: 'markdown', label: 'Artikel' },
    { value: 'html',     label: 'App' },
  ]

  const makeHref = (overrides: Record<string, string>) => {
    const p = { tab, type, ...(tag ? { tag } : {}), ...overrides }
    return '/?' + new URLSearchParams(p).toString()
  }

  return (
    <>
      <Navbar />

      {/* Unified scrollable filter strip */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 40,
        background: 'rgba(247,245,242,0.96)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e0d8',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.5rem 1.5rem',
          overflowX: 'auto', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Tabs */}
          {tabs.map(t => {
            if (t.needsAuth && !session) return null
            const active = tab === t.key
            return (
              <Link key={t.key} href={makeHref({ tab: t.key })}
                style={{ flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: active ? 700 : 400, textDecoration: 'none', background: active ? '#1a1a1a' : 'transparent', color: active ? '#f7f5f2' : '#6e6a65', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {t.label}
              </Link>
            )
          })}

          {/* Divider */}
          <span style={{ flexShrink: 0, color: '#d5c9b0', padding: '0 0.25rem', fontSize: '0.75rem' }}>|</span>

          {/* Type filter */}
          {typeLinks.map(t => {
            const active = type === t.value
            return (
              <Link key={t.value} href={makeHref({ type: t.value, tag: '' })}
                style={{ flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: active ? 700 : 400, textDecoration: 'none', background: active ? '#f0ede8' : 'transparent', color: active ? '#1a1a1a' : '#9c9690', border: active ? '1px solid #d5c9b0' : '1px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {t.label}
              </Link>
            )
          })}

          {/* Tag chips */}
          {topTags.length > 0 && (
            <>
              <span style={{ flexShrink: 0, color: '#d5c9b0', padding: '0 0.25rem', fontSize: '0.75rem' }}>|</span>
              {topTags.map(t => {
                const active = tag === t
                return (
                  <Link key={t} href={makeHref({ tag: t })}
                    style={{ flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: active ? 700 : 400, textDecoration: 'none', background: active ? '#1a1a1a' : 'transparent', color: active ? '#f7f5f2' : '#9c9690', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                    #{t}
                  </Link>
                )
              })}
            </>
          )}
        </div>
        </div>
      </div>

      {/* Hero — only for logged-out users */}
      {!session && (
        <div style={{ borderBottom: '1px solid #e5e0d8', background: '#ffffff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-hero">
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800,
              letterSpacing: '-0.04em', color: '#1a1a1a', lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}>
              Karya kamu layak<br />menghasilkan uang.
            </h1>
            <p style={{
              color: '#6e6a65', fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              lineHeight: 1.65, maxWidth: '500px', margin: '0 auto 2rem',
            }}>
              Platform untuk kreator Indonesia — tulis artikel, publish tools, dan monetisasi karya langsung dari satu tempat.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                background: '#1a1a1a', color: '#ffffff',
                padding: '0.75rem 2rem', borderRadius: '8px',
                textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 700,
                letterSpacing: '-0.01em',
              }}>
                Mulai gratis
              </Link>
              <Link href="/login" style={{
                background: '#ffffff', color: '#1a1a1a',
                padding: '0.75rem 2rem', borderRadius: '8px',
                border: '1px solid #e5e0d8',
                textDecoration: 'none', fontSize: '0.9375rem',
              }}>
                Masuk
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Creator showcase — always visible */}
      <div style={{ borderBottom: '1px solid #e5e0d8', background: '#fafaf8' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-showcase">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>
                {totalUsers.toLocaleString('id-ID')} kreator bergabung
              </span>
              <span style={{ fontSize: '0.875rem', color: '#9c9690' }}> · {totalPosts.toLocaleString('id-ID')} konten dipublish</span>
            </div>
            {!session && (
              <Link href="/register" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', borderBottom: '1.5px solid #1a1a1a', paddingBottom: '1px' }}>
                Bergabung sekarang →
              </Link>
            )}
          </div>
          {/* Creator avatars */}
          <div className="creator-strip">
            {recentCreators.map(creator => (
              <Link key={creator.username} href={`/@${creator.username}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.625rem 0.375rem 0.375rem', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '20px', transition: 'border-color 0.15s' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#6e6a65' }}>
                  {creator.profilePic
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={creator.profilePic} alt={creator.name ?? creator.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (creator.name?.[0] ?? creator.username[0]).toUpperCase()
                  }
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                  {creator.name ?? `@${creator.username}`}
                </span>
                {creator._count.posts > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#9c9690' }}>
                    {creator._count.posts}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-main">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            {tab === 'trending' ? 'Trending' : tab === 'diikuti' ? 'Diikuti' : 'Jelajahi'}
          </h2>
          {posts.length > 0 && (
            <span style={{ fontSize: '0.8125rem', color: '#9c9690' }}>
              {posts.length}+ konten
            </span>
          )}
        </div>

        <FeedGrid
          key={`${tab}-${type}-${tag}`}
          initialPosts={posts as Parameters<typeof FeedGrid>[0]['initialPosts']}
          initialHasMore={hasMore}
          initialCursor={nextCursor}
          tab={tab}
          postType={type}
          tag={tag}
        />

        {/* CTA join banner — bottom of feed, non-logged in only */}
        {!session && (
          <div className="home-cta">
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              Siap jadi kreator?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Bergabung dengan {totalUsers.toLocaleString('id-ID')} kreator yang sudah publish di Tweak. Gratis selamanya.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ background: '#ffffff', color: '#1a1a1a', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 700 }}>
                Daftar gratis
              </Link>
              <Link href="/login" style={{ background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '0.75rem 2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '0.9375rem' }}>
                Sudah punya akun
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
