import Navbar from '@/components/Navbar'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FeedGrid from '@/components/feed/FeedGrid'
import Link from 'next/link'

interface SearchParams { tab?: string; type?: string }

const TAKE = 12

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp      = await searchParams
  const tab     = sp.tab ?? 'terbaru'
  const type    = sp.type ?? 'all'
  const session = await getServerSession(authOptions)

  const baseWhere = {
    published: true,
    isPrivate: false,
    ...(type !== 'all' ? { type } : {}),
  }

  let where = baseWhere as Record<string, unknown>

  if (tab === 'diikuti' && session) {
    where = { ...baseWhere, author: { followers: { some: { followerId: session.user.id } } } }
  }

  const orderBy = tab === 'trending'
    ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
    : { publishedAt: 'desc' as const }

  const rawPosts = await db.post.findMany({
    where, orderBy,
    take: TAKE + 1,
    select: {
      id: true, slug: true, title: true, description: true, type: true,
      category: true, coverImage: true, isPremium: true, price: true,
      viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
      author: { select: { username: true, name: true, profilePic: true } },
    },
  })

  const hasMore = rawPosts.length > TAKE
  const posts   = hasMore ? rawPosts.slice(0, TAKE) : rawPosts
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

  return (
    <>
      <Navbar />

      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 40,
        background: 'rgba(247,245,242,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e0d8',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', height: '44px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {tabs.map(t => {
              if (t.needsAuth && !session) return null
              const active = tab === t.key
              return (
                <Link
                  key={t.key}
                  href={`/?tab=${t.key}&type=${type}`}
                  style={{
                    padding: '0.3rem 0.875rem', borderRadius: '20px',
                    fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                    textDecoration: 'none',
                    background: active ? '#1a1a1a' : 'transparent',
                    color: active ? '#f7f5f2' : '#6e6a65',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {typeLinks.map(t => {
              const active = type === t.value
              return (
                <Link
                  key={t.value}
                  href={`/?tab=${tab}&type=${t.value}`}
                  style={{
                    padding: '0.25rem 0.75rem', borderRadius: '20px',
                    fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                    textDecoration: 'none',
                    background: active ? '#f0ede8' : 'transparent',
                    color: active ? '#1a1a1a' : '#9c9690',
                    border: active ? '1px solid #d5c9b0' : '1px solid transparent',
                  }}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {/* Hero — only for guests */}
        {!session && (
          <div style={{ textAlign: 'center', padding: '2rem 0 1.75rem', borderBottom: '1px solid #e5e0d8', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '0.625rem' }}>
              Publish. Share. Earn.
            </h1>
            <p style={{ color: '#6e6a65', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Platform untuk kreator Indonesia: tulis artikel, bangun audiens, monetisasi karya.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/register" style={{ background: '#1a1a1a', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600 }}>Mulai gratis</Link>
              <Link href="/login" style={{ background: '#ffffff', color: '#1a1a1a', padding: '0.625rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e0d8', textDecoration: 'none', fontSize: '0.9375rem' }}>Masuk</Link>
            </div>
          </div>
        )}

        <FeedGrid
          key={`${tab}-${type}`}
          initialPosts={posts as Parameters<typeof FeedGrid>[0]['initialPosts']}
          initialHasMore={hasMore}
          initialCursor={nextCursor}
          tab={tab}
          postType={type}
        />
      </main>
    </>
  )
}
