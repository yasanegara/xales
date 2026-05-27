import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { db } from '@/lib/prisma'

interface SearchParams {
  type?: string
  sort?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const type = sp.type
  const sort = sp.sort ?? 'latest'

  const where = {
    published: true,
    ...(type && type !== 'all' ? { type } : {}),
  }

  const orderBy =
    sort === 'trending'
      ? [{ viewCount: 'desc' as const }, { likeCount: 'desc' as const }]
      : { publishedAt: 'desc' as const }

  const posts = await db.post.findMany({
    where,
    orderBy,
    take: 30,
    include: {
      author: { select: { username: true, name: true, profilePic: true } },
    },
  })

  const tabLinks = [
    { label: 'Semua', value: 'all' },
    { label: 'Artikel', value: 'markdown' },
    { label: 'Apps', value: 'html' },
  ]

  const sortLinks = [
    { label: 'Terbaru', value: 'latest' },
    { label: 'Trending', value: 'trending' },
  ]

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '2.5rem 0 2rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            Publish. Share. Earn.
          </h1>
          <p style={{ color: '#888888', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Platform untuk kreator: publish artikel &amp; web app, bangun audiens, monetisasi karya.
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {tabLinks.map((t) => {
              const active = (!type && t.value === 'all') || type === t.value
              return (
                <a
                  key={t.value}
                  href={`/?type=${t.value}&sort=${sort}`}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    background: active ? '#1a1a1a' : 'transparent',
                    color: active ? '#ededed' : '#888888',
                    border: active ? '1px solid #333333' : '1px solid transparent',
                  }}
                >
                  {t.label}
                </a>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {sortLinks.map((s) => {
              const active = sort === s.value
              return (
                <a
                  key={s.value}
                  href={`/?type=${type ?? 'all'}&sort=${s.value}`}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                    background: active ? '#0070f3' : 'transparent',
                    color: active ? '#fff' : '#888888',
                    border: '1px solid transparent',
                  }}
                >
                  {s.label}
                </a>
              )
            })}
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888888' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</p>
            <p>Belum ada post. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
