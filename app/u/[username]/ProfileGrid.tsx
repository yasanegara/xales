'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const ARTICLE_GRADIENTS = [
  'linear-gradient(145deg, #b8865a 0%, #8b5e3c 100%)',
  'linear-gradient(145deg, #9a7a50 0%, #705a38 100%)',
  'linear-gradient(145deg, #c4956a 0%, #946040 100%)',
  'linear-gradient(145deg, #a07850 0%, #7a5a34 100%)',
  'linear-gradient(145deg, #b09060 0%, #886840 100%)',
]
const APP_GRADIENTS = [
  'linear-gradient(145deg, #4a6a8a 0%, #2e4e6a 100%)',
  'linear-gradient(145deg, #5a7a96 0%, #3a5a76 100%)',
  'linear-gradient(145deg, #3e6278 0%, #264858 100%)',
  'linear-gradient(145deg, #4e7090 0%, #305070 100%)',
  'linear-gradient(145deg, #5a7888 0%, #385868 100%)',
]

interface GridPost {
  id: string
  slug: string
  title: string
  description?: string | null
  type: string
  category?: string | null
  coverImage?: string | null
  isPremium: boolean
  price?: number | null
  viewCount: number
  likeCount: number
}

interface Props {
  posts: GridPost[]
  username: string
}

function PostCard({ post, idx, username }: { post: GridPost; idx: number; username: string }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const gradient = isApp
    ? APP_GRADIENTS[idx % APP_GRADIENTS.length]
    : ARTICLE_GRADIENTS[idx % ARTICLE_GRADIENTS.length]
  const bigLetter = post.title.trimStart()[0]?.toUpperCase() ?? '✦'

  return (
    <Link
      href={`/@${username}/${post.slug}`}
      style={{
        textDecoration: 'none', display: 'block',
        aspectRatio: '1 / 1', position: 'relative',
        borderRadius: '10px', overflow: 'hidden',
        boxShadow: hovered ? '6px 6px 0 #1a1a1a' : '4px 4px 0 #1a1a1a',
        transition: 'box-shadow 0.15s, transform 0.15s',
        transform: hovered ? 'translate(-1px, -1px)' : 'translate(0, 0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background */}
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: `translate(-50%, -50%) scale(${hovered ? 1.04 : 1})`,
            minWidth: '100%', minHeight: '100%',
            width: 'auto', height: 'auto',
            maxWidth: 'none',
            transition: 'transform 0.35s ease',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Decorative letter */}
          <div style={{
            fontSize: 'clamp(4rem, 20vw, 7rem)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.12)',
            lineHeight: 1,
            userSelect: 'none',
            fontFamily: 'Georgia, serif',
            position: 'absolute',
            bottom: '-0.1em', right: '0.05em',
          }}>
            {bigLetter}
          </div>
        </div>
      )}

      {/* Bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        padding: 'clamp(0.5rem, 3vw, 0.875rem)',
        paddingTop: 'clamp(1.5rem, 8vw, 2.5rem)',
        transform: hovered ? 'translateY(0)' : 'translateY(0)',
      }}>
        {/* Type + category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 'clamp(0.5rem, 1.4vw, 0.65rem)',
            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            background: isApp ? '#3b82f6' : '#c4956a',
            color: '#ffffff',
            padding: '0.1rem 0.35rem', borderRadius: '3px',
          }}>
            {isApp ? 'App' : 'Artikel'}
          </span>
          {post.isPremium && (
            <span style={{
              fontSize: 'clamp(0.5rem, 1.4vw, 0.6rem)',
              fontWeight: 700, letterSpacing: '0.04em',
              color: '#fbbf24',
            }}>★</span>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 'clamp(0.625rem, 2vw, 0.8125rem)',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          marginBottom: '0.25rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          fontFamily: 'Georgia, serif',
        }}>
          {post.title}
        </div>

        {/* Stats */}
        <div style={{
          fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
          color: 'rgba(255,255,255,0.7)',
          display: 'flex', gap: '0.5rem',
        }}>
          <span>👁 {post.viewCount.toLocaleString()}</span>
          <span>♥ {post.likeCount.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

export default function ProfileGrid({ posts, username }: Props) {
  const [tab, setTab]   = useState<'artikel' | 'app'>('artikel')
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const check = () => setCols(window.innerWidth < 600 ? 2 : 3)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const articles = posts.filter(p => p.type === 'markdown')
  const apps     = posts.filter(p => p.type === 'html')
  const visible  = tab === 'artikel' ? articles : apps

  const tabList = [
    { key: 'artikel' as const, label: 'Artikel', count: articles.length, color: '#c4956a' },
    { key: 'app'     as const, label: 'App',     count: apps.length,      color: '#4a6a8a' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e0d8', marginBottom: '1.25rem' }}>
        {tabList.map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '0.625rem 0',
                background: 'none', border: 'none',
                borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 400,
                color: active ? '#1a1a1a' : '#9c9690',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              }}
            >
              {t.label}
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                background: active ? t.color : '#f0ede8',
                color: active ? '#fff' : '#9c9690',
                borderRadius: '10px', padding: '0.1rem 0.45rem',
                transition: 'all 0.15s',
              }}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9c9690', padding: '3rem 0', fontSize: '0.9375rem' }}>
          Belum ada {tab === 'artikel' ? 'artikel' : 'app'}.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '0.5rem',
        }}>
          {visible.map((post, i) => (
            <PostCard key={post.id} post={post} idx={i} username={username} />
          ))}
        </div>
      )}
    </div>
  )
}
