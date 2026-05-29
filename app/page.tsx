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

  // Fetch posts + available tags in parallel
  const [rawPosts, tagRows] = await Promise.all([
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

      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 40,
        background: 'rgba(247,245,242,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e0d8',
      }}>
        <div style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', height: '44px' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {tabs.map(t => {
              if (t.needsAuth && !session) return null
              const active = tab === t.key
              return (
                <Link key={t.key} href={makeHref({ tab: t.key })}
                  style={{ padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: active ? 600 : 400, textDecoration: 'none', background: active ? '#1a1a1a' : 'transparent', color: active ? '#f7f5f2' : '#6e6a65', transition: 'all 0.15s' }}>
                  {t.label}
                </Link>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {typeLinks.map(t => {
              const active = type === t.value
              return (
                <Link key={t.value} href={makeHref({ type: t.value, tag: '' })}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: active ? 600 : 400, textDecoration: 'none', background: active ? '#f0ede8' : 'transparent', color: active ? '#1a1a1a' : '#9c9690', border: active ? '1px solid #d5c9b0' : '1px solid transparent' }}>
                  {t.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <main style={{ padding: '1.25rem 1.5rem 3rem' }}>
        {!session && (
          <div style={{ textAlign: 'center', padding: '2.25rem 0 2rem', borderBottom: '1px solid #e5e0d8', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.875rem, 5vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '0.75rem', fontFamily: 'Georgia, serif' }}>
              Publish. Share. Earn.
            </h1>
            <p style={{ color: '#6e6a65', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Platform untuk kreator Indonesia — tulis artikel, bangun audiens, monetisasi karya.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/register" style={{ background: '#1a1a1a', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600 }}>Mulai gratis</Link>
              <Link href="/login" style={{ background: '#ffffff', color: '#1a1a1a', padding: '0.625rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e0d8', textDecoration: 'none', fontSize: '0.9375rem' }}>Masuk</Link>
            </div>
          </div>
        )}

        {/* Tag chips — below hero */}
        {topTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            <Link href={makeHref({ tag: '' })} style={{ flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: !tag ? 600 : 400, textDecoration: 'none', background: !tag ? '#1a1a1a' : '#f0ede8', color: !tag ? '#f7f5f2' : '#6e6a65', whiteSpace: 'nowrap', border: '1px solid transparent' }}>
              Semua
            </Link>
            {topTags.map(t => {
              const active = tag === t
              return (
                <Link key={t} href={makeHref({ tag: t })} style={{ flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: active ? 600 : 400, textDecoration: 'none', background: active ? '#1a1a1a' : '#f0ede8', color: active ? '#f7f5f2' : '#6e6a65', whiteSpace: 'nowrap', border: '1px solid transparent' }}>
                  #{t}
                </Link>
              )
            })}
          </div>
        )}

        <FeedGrid
          key={`${tab}-${type}-${tag}`}
          initialPosts={posts as Parameters<typeof FeedGrid>[0]['initialPosts']}
          initialHasMore={hasMore}
          initialCursor={nextCursor}
          tab={tab}
          postType={type}
          tag={tag}
        />
      </main>
    </>
  )
}
