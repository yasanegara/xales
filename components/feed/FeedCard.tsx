'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDate, readingTime } from '@/lib/utils'

export interface FeedPost {
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
  publishedAt?: Date | string | null
  createdAt: Date | string
  author: { username: string; name?: string | null; profilePic?: string | null }
  content?: string
}

function Avatar({ author }: { author: FeedPost['author'] }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '5px', flexShrink: 0,
      background: '#f0ede8', border: '1px solid #e5e0d8',
      overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6rem', fontWeight: 700, color: '#6e6a65',
    }}>
      {author.profilePic
        ? <img src={author.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        : (author.name?.[0] ?? author.username[0]).toUpperCase()
      }
    </div>
  )
}

function TypeBadge({ type, isPremium }: { type: string; isPremium: boolean }) {
  const isApp = type === 'html'
  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      <span style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        background: isApp ? '#ecfdf5' : '#eff6ff',
        color: isApp ? '#059669' : '#2563eb',
        padding: '0.1rem 0.4rem', borderRadius: '3px',
      }}>{isApp ? 'App' : 'Artikel'}</span>
      {isPremium && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>Premium</span>}
    </div>
  )
}

function Meta({ post }: { post: FeedPost }) {
  const date = post.publishedAt ?? post.createdAt
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9c9690', flexWrap: 'wrap' }}>
      <Avatar author={post.author} />
      <span style={{ color: '#6e6a65', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
      <span>·</span>
      <span>{formatDate(date)}</span>
      <span>·</span>
      <span>👁 {post.viewCount.toLocaleString()}</span>
      <span>♥ {post.likeCount.toLocaleString()}</span>
    </div>
  )
}

// ─── Featured large card ───────────────────────────────────────────────────
export function FeaturedCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const hasImage = !!post.coverImage
  const isApp = post.type === 'html'
  const bg = isApp
    ? 'linear-gradient(145deg, #2A4A7F 0%, #1a3060 100%)'
    : 'linear-gradient(145deg, #8B3A2A 0%, #5c2218 100%)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '280px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background */}
      {hasImage
        ? <img src={post.coverImage!} alt={post.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
        : <div style={{ position: 'absolute', inset: 0, background: bg }} />
      }

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
        <TypeBadge type={post.type} isPremium={post.isPremium} />
        {post.category && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{post.category}</div>}
        <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.375rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.35, margin: '0.5rem 0 0.75rem', fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {post.title}
        </h2>
        <Meta post={post} />
      </div>
    </Link>
  )
}

// ─── Medium card (featured row, 2nd & 3rd) ───────────────────────────────
export function MediumCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const bg = isApp ? 'linear-gradient(145deg, #4a6a8a 0%, #2e4e6a 100%)' : 'linear-gradient(145deg, #9a7a50 0%, #6b5230 100%)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', position: 'relative', flex: 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background */}
      <div style={{ height: '130px', position: 'relative', overflow: 'hidden' }}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s ease' }} />
          : <div style={{ width: '100%', height: '100%', background: bg }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}><TypeBadge type={post.type} isPremium={post.isPremium} /></div>
      </div>
      <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #e5e0d8', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>
          {post.title}
        </div>
        <Meta post={post} />
      </div>
    </Link>
  )
}

// ─── Article card (horizontal) ────────────────────────────────────────────
export function ArticleCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
        background: '#ffffff', border: `1px solid ${hovered ? '#cfc9c0' : '#e5e0d8'}`,
        borderRadius: '10px', padding: '0.875rem',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
      }}>
        {/* Thumbnail */}
        <div style={{ width: 72, height: 72, borderRadius: '8px', flexShrink: 0, overflow: 'hidden', background: '#f0ede8', position: 'relative' }}>
          {post.coverImage
            ? <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📝</div>
          }
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TypeBadge type={post.type} isPremium={post.isPremium} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, margin: '0.3rem 0 0.375rem', fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.5, margin: '0 0 0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.description}
            </p>
          )}
          <Meta post={post} />
        </div>
      </article>
    </Link>
  )
}

// ─── App card (visual/cover dominant) ────────────────────────────────────
export function AppCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const bg = 'linear-gradient(145deg, #4a6a8a 0%, #2e4e6a 100%)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: '#ffffff', border: `1px solid ${hovered ? '#cfc9c0' : '#e5e0d8'}`,
        borderRadius: '10px', overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
      }}>
        {/* Cover */}
        <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
          {post.coverImage
            ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.3s ease' }} />
            : <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🔗</div>
          }
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}><TypeBadge type={post.type} isPremium={post.isPremium} /></div>
        </div>
        {/* Text */}
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, margin: '0 0 0.375rem', fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.5, margin: '0 0 0.4rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.description}
            </p>
          )}
          <Meta post={post} />
        </div>
      </article>
    </Link>
  )
}
