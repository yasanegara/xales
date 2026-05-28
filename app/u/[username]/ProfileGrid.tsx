'use client'

import Link from 'next/link'
import { useState } from 'react'

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(n) }

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

// Article card colors — warm paper tones
const ARTICLE_ACCENTS = ['#c4956a', '#8b7355', '#a07850', '#b08968', '#9a7a60']
// App card colors — cooler tones
const APP_ACCENTS     = ['#5b7fa6', '#6b8fa0', '#4a7a8a', '#5a8096', '#4e7090']

function PostCard({ post, idx, username }: { post: GridPost; idx: number; username: string }) {
  const [hovered, setHovered] = useState(false)

  const isApp = post.type === 'html'
  const accent = isApp
    ? APP_ACCENTS[idx % APP_ACCENTS.length]
    : ARTICLE_ACCENTS[idx % ARTICLE_ACCENTS.length]

  // Large decorative letter from title
  const bigLetter = post.title.trimStart()[0]?.toUpperCase() ?? '✦'

  return (
    <Link
      href={`/@${username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        borderRadius: '12px',
        border: `1px solid ${hovered ? accent : '#e5e0d8'}`,
        overflow: 'hidden',
        background: '#ffffff',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 32px rgba(0,0,0,0.10), 0 0 0 1px ${accent}33`
          : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}>

        {/* Accent top bar */}
        <div style={{ height: 3, background: accent, flexShrink: 0 }} />

        {/* Cover image */}
        {post.coverImage && (
          <div style={{ height: 130, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Body */}
        <div style={{
          flex: 1,
          padding: '1rem',
          background: post.coverImage ? '#ffffff' : '#faf8f5',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative letter — only when no cover image */}
          {!post.coverImage && (
            <div style={{
              position: 'absolute',
              right: '0.625rem',
              top: '0.25rem',
              fontSize: '5rem',
              fontWeight: 900,
              color: accent,
              opacity: 0.07,
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
              fontFamily: 'Georgia, serif',
            }}>
              {bigLetter}
            </div>
          )}

          {/* Type + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: accent,
              padding: '0.15rem 0.45rem',
              borderRadius: '3px',
            }}>
              {isApp ? 'App' : 'Artikel'}
            </span>
            {post.category && (
              <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{post.category}</span>
            )}
            {post.isPremium && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: '#b45309',
                background: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '3px',
              }}>
                {post.price ? `Rp ${formatIDR(post.price)}` : 'Premium'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            lineHeight: 1.45,
            color: '#1a1a1a',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: post.coverImage ? 3 : 4,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            fontFamily: 'Georgia, serif',
            position: 'relative',
          }}>
            {post.title}
          </h3>

          {/* Description — only without cover */}
          {!post.coverImage && post.description && (
            <p style={{
              fontSize: '0.8125rem',
              color: '#6e6a65',
              lineHeight: 1.55,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {post.description}
            </p>
          )}

          {/* Footer stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginTop: 'auto',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f0ede8',
            fontSize: '0.75rem',
            color: '#9c9690',
          }}>
            <span>👁 {post.viewCount.toLocaleString()}</span>
            <span style={{ color: '#d0c9b8' }}>·</span>
            <span>♥ {post.likeCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function ProfileGrid({ posts, username }: Props) {
  const [tab, setTab] = useState<'artikel' | 'app'>('artikel')

  const articles = posts.filter(p => p.type === 'markdown')
  const apps     = posts.filter(p => p.type === 'html')
  const visible  = tab === 'artikel' ? articles : apps

  const tabs = [
    { key: 'artikel' as const, label: 'Artikel', count: articles.length, accent: '#8b7355' },
    { key: 'app'     as const, label: 'App',     count: apps.length,      accent: '#5b7fa6' },
  ]

  if (posts.length === 0) return null

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e0d8',
        marginBottom: '1.5rem',
        gap: 0,
      }}>
        {tabs.map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                borderBottom: active ? `2px solid ${t.accent}` : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 400,
                color: active ? '#1a1a1a' : '#9c9690',
                transition: 'color 0.15s, border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              {t.label}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                background: active ? t.accent : '#f0ede8',
                color: active ? '#ffffff' : '#9c9690',
                borderRadius: '10px',
                padding: '0.1rem 0.45rem',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid — 2 columns */}
      {visible.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9c9690', padding: '3rem 0', fontSize: '0.9375rem' }}>
          Belum ada {tab === 'artikel' ? 'artikel' : 'app'}.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}>
          {visible.map((post, i) => (
            <PostCard key={post.id} post={post} idx={i} username={username} />
          ))}
        </div>
      )}
    </div>
  )
}
