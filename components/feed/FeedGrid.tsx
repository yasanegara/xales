'use client'

import { useState } from 'react'
import { DiscoverCard, type FeedPost } from './FeedCard'
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
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9c9690' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          {tab === 'diikuti' ? '👥' : '📝'}
        </p>
        <p style={{ fontSize: '0.9375rem' }}>
          {tab === 'diikuti' ? 'Belum ada post dari kreator yang kamu ikuti.' : 'Belum ada konten.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
      }}>
        {posts.map((post, i) => (
          <div key={post.id}>
            {i > 0 && i % 16 === 0 && (
              <div style={{ gridColumn: '1 / -1', margin: '0.5rem 0' }}>
                <SuggestedUsers compact />
              </div>
            )}
            <DiscoverCard post={post} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '1rem' }}>
          <button onClick={loadMore} disabled={loading}
            style={{
              padding: '0.625rem 2.5rem', borderRadius: '8px',
              border: '1px solid #1a1a1a', background: loading ? '#f7f5f2' : '#1a1a1a',
              color: loading ? '#9c9690' : '#ffffff',
              fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}>
            {loading ? 'Memuat...' : 'Tampilkan lebih banyak'}
          </button>
        </div>
      )}
    </div>
  )
}
