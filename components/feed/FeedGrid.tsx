'use client'

import { useState } from 'react'
import { FeaturedCard, MediumCard, ArticleCard, AppCard, type FeedPost } from './FeedCard'
import SuggestedUsers from '@/components/SuggestedUsers'

interface Props {
  initialPosts: FeedPost[]
  initialHasMore: boolean
  initialCursor: string | null
  tab: string
  postType: string
  tag?: string
}

export default function FeedGrid({ initialPosts, initialHasMore, initialCursor, tab, postType, tag = '' }: Props) {
  const [posts, setPosts]       = useState<FeedPost[]>(initialPosts)
  const [hasMore, setHasMore]   = useState(initialHasMore)
  const [cursor, setCursor]     = useState<string | null>(initialCursor)
  const [loading, setLoading]   = useState(false)

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const params = new URLSearchParams({ tab, type: postType, ...(tag ? { tag } : {}), ...(cursor ? { cursor } : {}) })
    const res = await fetch(`/api/feed?${params}`)
    const data = await res.json()
    setPosts(p => [...p, ...data.posts])
    setHasMore(data.hasMore)
    setCursor(data.nextCursor)
    setLoading(false)
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6e6a65' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          {tab === 'diikuti' ? '👥' : '📝'}
        </p>
        <p>{tab === 'diikuti' ? 'Belum ada post dari creator yang kamu ikuti.' : 'Belum ada konten.'}</p>
      </div>
    )
  }

  // Split: first 3 featured, rest in grid
  const featured = posts.slice(0, 3)
  const rest      = posts.slice(3)
  const [hero, ...mediums] = featured

  return (
    <div>
      {/* Featured section */}
      {hero && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'stretch' }}>
          {/* Hero card */}
          <div style={{ flex: '0 0 58%' }}>
            <FeaturedCard post={hero} />
          </div>
          {/* Medium cards */}
          {mediums.length > 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mediums.map(p => <MediumCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      )}

      {/* 2-column grid */}
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {rest.map((post, i) => {
            const card = post.type === 'html'
              ? <AppCard key={post.id} post={post} />
              : <ArticleCard key={post.id} post={post} />

            // Insert suggested users after every 6th post
            if (i > 0 && i % 6 === 0) {
              return (
                <>
                  <div key={`suggest-${i}`} style={{ gridColumn: '1 / -1' }}>
                    <SuggestedUsers compact />
                  </div>
                  {card}
                </>
              )
            }
            return card
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: '0.625rem 2rem', borderRadius: '8px',
              border: '1px solid #e5e0d8', background: '#ffffff',
              color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 500,
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
              transition: 'border-color 0.15s',
            }}
          >
            {loading ? 'Memuat...' : 'Tampilkan lebih banyak'}
          </button>
        </div>
      )}
    </div>
  )
}
