'use client'

import { useState } from 'react'
import { FullCard, type FeedPost } from './FeedCard'
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
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6e6a65' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          {tab === 'diikuti' ? '👥' : '📝'}
        </p>
        <p>{tab === 'diikuti' ? 'Belum ada post dari creator yang kamu ikuti.' : 'Belum ada konten.'}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {posts.map((post, i) => (
          <div key={post.id}>
            {i > 0 && i % 6 === 0 && (
              <div style={{ margin: '0.5rem 0 1rem' }}>
                <SuggestedUsers compact />
              </div>
            )}
            <FullCard post={post} />
          </div>
        ))}
      </div>

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
