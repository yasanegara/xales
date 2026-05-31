'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DiscoverCard, type FeedPost } from './FeedCard'
import Link from 'next/link'

const TAKE = 12

interface Props {
  initialPosts: FeedPost[]
  initialHasMore: boolean
  initialCursor: string | null
  initialTab: string
  initialType: string
  initialTag: string
  topTags: string[]
  hasSession: boolean
}

const TABS = [
  { key: 'terbaru',  label: 'Terbaru',  needsAuth: false },
  { key: 'trending', label: 'Trending', needsAuth: false },
  { key: 'diikuti',  label: 'Diikuti',  needsAuth: true },
]
const TYPES = [
  { value: 'all',      label: 'Semua' },
  { value: 'markdown', label: 'Artikel' },
  { value: 'html',     label: 'App' },
]

export default function FeedSection({ initialPosts, initialHasMore, initialCursor, initialTab, initialType, initialTag, topTags, hasSession }: Props) {
  const router    = useRouter()
  const pathname  = usePathname()
  const [isPending, startTransition] = useTransition()

  const [tab,     setTab]     = useState(initialTab)
  const [type,    setType]    = useState(initialType)
  const [tag,     setTag]     = useState(initialTag)
  const [posts,   setPosts]   = useState<FeedPost[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor,  setCursor]  = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Keep URL in sync for sharing/bookmarking
  const syncUrl = useCallback((t: string, tp: string, tg: string) => {
    const p = new URLSearchParams()
    if (t !== 'terbaru') p.set('tab', t)
    if (tp !== 'all') p.set('type', tp)
    if (tg) p.set('tag', tg)
    const qs = p.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : pathname)
  }, [pathname])

  const fetchFeed = useCallback(async (newTab: string, newType: string, newTag: string, append = false, cur?: string | null) => {
    setFetching(true)
    const params = new URLSearchParams({ tab: newTab, type: newType })
    if (newTag) params.set('tag', newTag)
    if (cur) params.set('cursor', cur)
    try {
      const res  = await fetch(`/api/feed?${params}`)
      const data = await res.json()
      if (append) {
        setPosts(p => [...p, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
    } finally {
      setFetching(false)
    }
  }, [])

  const changeFilter = useCallback((newTab: string, newType: string, newTag: string) => {
    setTab(newTab)
    setType(newType)
    setTag(newTag)
    setPosts([])       // clear instantly → skeleton muncul seketika
    setHasMore(false)
    syncUrl(newTab, newType, newTag)
    fetchFeed(newTab, newType, newTag)
  }, [fetchFeed, syncUrl])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    await fetchFeed(tab, type, tag, true, cursor)
    setLoading(false)
  }, [loading, hasMore, fetchFeed, tab, type, tag, cursor])

  const label = tab === 'trending' ? 'Trending' : tab === 'diikuti' ? 'Diikuti' : 'Jelajahi'

  const pill = (active: boolean, onClick: () => void, children: React.ReactNode, variant: 'dark' | 'light' = 'dark') => (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: '20px',
      border: variant === 'light' ? `1px solid ${active ? '#d5c9b0' : 'transparent'}` : 'none',
      background: active
        ? (variant === 'dark' ? '#1a1a1a' : '#f0ede8')
        : 'transparent',
      color: active
        ? (variant === 'dark' ? '#f7f5f2' : '#1a1a1a')
        : (variant === 'dark' ? '#6e6a65' : '#9c9690'),
      fontSize: '0.8125rem', fontWeight: active ? 700 : 400,
      cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'background 0.1s, color 0.1s',
    }}>{children}</button>
  )

  return (
    <>
      {/* Filter strip */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 40,
        background: 'rgba(247,245,242,0.96)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${fetching ? '#1a1a1a22' : '#e5e0d8'}`,
        transition: 'border-color 0.2s',
      }}>
        {/* Loading bar */}
        {fetching && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: '#1a1a1a', animation: 'progress-bar 0.8s ease-in-out infinite', right: 0 }} />
        )}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.5rem 1.5rem',
            overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            {TABS.map(t => {
              if (t.needsAuth && !hasSession) return null
              return pill(tab === t.key, () => changeFilter(t.key, type, tag), t.label, 'dark')
            })}

            <span style={{ flexShrink: 0, color: '#d5c9b0', padding: '0 0.25rem', fontSize: '0.75rem' }}>|</span>

            {TYPES.map(t => pill(
              type === t.value,
              () => changeFilter(tab, t.value, ''),
              t.label, 'light'
            ))}

            {topTags.length > 0 && (
              <>
                <span style={{ flexShrink: 0, color: '#d5c9b0', padding: '0 0.25rem', fontSize: '0.75rem' }}>|</span>
                {topTags.map(t => pill(
                  tag === t,
                  () => changeFilter(tab, type, tag === t ? '' : t),
                  `#${t}`, 'dark'
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-main">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            {label}
          </h2>
          {posts.length > 0 && (
            <span style={{ fontSize: '0.8125rem', color: '#9c9690' }}>
              {posts.length}+ konten
            </span>
          )}
        </div>

        {fetching && posts.length === 0 ? (
          // Skeleton grid while first load
          <div className="feed-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skel" style={{ height: '160px', borderRadius: '10px' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9c9690' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              {tab === 'diikuti' ? '👥' : '📝'}
            </p>
            <p style={{ fontSize: '0.9375rem' }}>
              {tab === 'diikuti' ? 'Belum ada post dari kreator yang kamu ikuti.' : 'Belum ada konten.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="feed-grid">
              {posts.map(post => <DiscoverCard key={post.id} post={post} />)}
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
        )}
      </main>

      <style>{`
        @keyframes progress-bar {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(0.6); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; opacity: 0; }
        }
      `}</style>
    </>
  )
}
