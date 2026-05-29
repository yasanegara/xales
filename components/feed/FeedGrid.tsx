'use client'

import { useState } from 'react'
import { GridCard, type FeedPost } from './FeedCard'
import HeroCarousel from './HeroCarousel'
import SuggestedUsers from '@/components/SuggestedUsers'

const HERO_COUNT = 5

interface Props {
  initialPosts: FeedPost[]
  initialHasMore: boolean
  initialCursor: string | null
  tab: string
  postType: string
  tag?: string
}

export default function FeedGrid({ initialPosts, initialHasMore, initialCursor, tab, postType, tag = '' }: Props) {
  const [posts, setPosts]     = useState<FeedPost[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor]   = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const params = new URLSearchParams({ tab, type: postType, ...(tag ? { tag } : {}), ...(cursor ? { cursor } : {}) })
    const res  = await fetch(`/api/feed?${params}`)
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

  const heroPosts = posts.slice(0, HERO_COUNT)
  const gridPosts = posts.slice(HERO_COUNT)

  return (
    <div>
      {/* Hero carousel */}
      <HeroCarousel posts={heroPosts} />

      {/* 2-column grid */}
      {gridPosts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
          {gridPosts.map((post, i) => (
            <div key={post.id}>
              {i > 0 && i % 8 === 0 && (
                <div style={{ gridColumn: '1 / -1', margin: '0.5rem 0' }}>
                  <SuggestedUsers compact />
                </div>
              )}
              <GridCard post={post} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <button onClick={loadMore} disabled={loading}
            style={{ padding: '0.625rem 2rem', borderRadius: '8px', border: '1px solid #e5e0d8', background: '#ffffff', color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 500, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Memuat...' : 'Tampilkan lebih banyak'}
          </button>
        </div>
      )}
    </div>
  )
}
