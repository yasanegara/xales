'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

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

function Avatar({ author, size = 24 }: { author: FeedPost['author']; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '6px', flexShrink: 0,
      background: '#f0ede8', border: '1px solid #e5e0d8',
      overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.4}px`, fontWeight: 700, color: '#6e6a65',
    }}>
      {author.profilePic
        ? <img src={author.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        : (author.name?.[0] ?? author.username[0]).toUpperCase()
      }
    </div>
  )
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: bg, color, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
      {children}
    </span>
  )
}

function PremiumBadge() {
  return <Badge bg="#fef3c7" color="#b45309">Premium</Badge>
}

function Meta({ post, light = false }: { post: FeedPost; light?: boolean }) {
  const date = post.publishedAt ?? post.createdAt
  const muted = light ? 'rgba(255,255,255,0.65)' : '#9c9690'
  const name  = light ? 'rgba(255,255,255,0.9)'  : '#6e6a65'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: muted, flexWrap: 'wrap' }}>
      <Avatar author={post.author} size={20} />
      <span style={{ color: name, fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{formatDate(date)}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>👁 {post.viewCount.toLocaleString()}</span>
    </div>
  )
}

// ─── Featured hero card ────────────────────────────────────────────────────
export function FeaturedCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const fallbackGrad = isApp
    ? 'linear-gradient(145deg, #1e3a5f 0%, #0f2340 100%)'
    : 'linear-gradient(145deg, #3d1a0f 0%, #1e0d07 100%)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '16px', overflow: 'hidden', position: 'relative', height: '300px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {post.coverImage
        ? <img src={post.coverImage} alt={post.title} loading="eager" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
        : <div style={{ position: 'absolute', inset: 0, background: fallbackGrad }} />
      }
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.12) 100%)' }} />

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.625rem' }}>
          <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
          {post.isPremium && <PremiumBadge />}
          {post.category && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{post.category}</span>}
        </div>
        <h2 style={{
          fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', fontWeight: 700,
          color: '#ffffff', lineHeight: 1.3, marginBottom: '0.75rem',
          fontFamily: 'Georgia, serif',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
        }}>
          {post.title}
        </h2>
        <Meta post={post} light />
      </div>
    </Link>
  )
}

// ─── Medium card (featured row 2nd & 3rd) ─────────────────────────────────
export function MediumCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const fallbackGrad = isApp ? 'linear-gradient(145deg, #1e3a5f, #0f2340)' : 'linear-gradient(145deg, #3d1a0f, #1e0d07)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', position: 'relative', flex: 1, minHeight: '140px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {post.coverImage
        ? <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
        : <div style={{ position: 'absolute', inset: 0, background: fallbackGrad }} />
      }
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.875rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
          <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
          {post.isPremium && <PremiumBadge />}
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', lineHeight: 1.35, fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {post.title}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.375rem' }}>
          {post.author.name ?? `@${post.author.username}`} · 👁 {post.viewCount.toLocaleString()}
        </div>
      </div>
    </Link>
  )
}

// ─── List card (X/Twitter-style row) ─────────────────────────────────────
export function ListCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'

  return (
    <Link href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
        padding: '0.875rem 0.5rem',
        borderBottom: '1px solid #f0ede8',
        background: hovered ? '#fafaf8' : 'transparent',
        borderRadius: '6px',
        transition: 'background 0.15s',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.3rem' }}>
            <Badge bg={isApp ? '#ecfdf5' : '#eff6ff'} color={isApp ? '#059669' : '#1d4ed8'}>
              {isApp ? 'App' : 'Artikel'}
            </Badge>
            {post.isPremium && <PremiumBadge />}
            {post.category && <span style={{ fontSize: '0.7rem', color: '#9c9690' }}>{post.category}</span>}
          </div>
          <h3 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a',
            lineHeight: 1.4, marginBottom: '0.25rem',
            fontFamily: 'Georgia, serif',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{
              fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.5,
              margin: '0 0 0.375rem',
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
            }}>
              {post.description}
            </p>
          )}
          <Meta post={post} />
        </div>
        {post.coverImage && (
          <div style={{ width: 80, height: 80, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={post.coverImage} alt="" loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </article>
    </Link>
  )
}

// ─── Article card (horizontal) ────────────────────────────────────────────
export function ArticleCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/@${post.author.username}/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <article style={{
        background: '#ffffff', border: `1px solid ${hovered ? '#c8c0b4' : '#e5e0d8'}`,
        borderRadius: '12px', padding: '1rem',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column', gap: '0.625rem', height: '100%',
      }}>
        {/* Cover image — square */}
        {post.coverImage ? (
          <div style={{ aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ height: 4, borderRadius: '4px', background: 'linear-gradient(to right, #3b5bdb, #7048e8)', flexShrink: 0 }} />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Badge bg="#eff6ff" color="#1d4ed8">Artikel</Badge>
            {post.isPremium && <PremiumBadge />}
            {post.category && <span style={{ fontSize: '0.7rem', color: '#9c9690' }}>{post.category}</span>}
          </div>
          <h3 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4,
            fontFamily: 'Georgia, serif',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.description}
            </p>
          )}
        </div>
        <Meta post={post} />
      </article>
    </Link>
  )
}

// ─── App card (visual) ────────────────────────────────────────────────────
export function AppCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const fallbackGrad = 'linear-gradient(145deg, #1e3a5f 0%, #0f2340 100%)'

  return (
    <Link href={`/@${post.author.username}/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <article style={{
        background: '#ffffff', border: `1px solid ${hovered ? '#c8c0b4' : '#e5e0d8'}`,
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s', height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {post.coverImage
            ? <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
            : <div style={{ width: '100%', height: '100%', background: fallbackGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🔗</div>
          }
          <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'flex', gap: '0.35rem' }}>
            <Badge bg="#065f46" color="#fff">App</Badge>
            {post.isPremium && <PremiumBadge />}
          </div>
        </div>
        <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.description}
            </p>
          )}
          <div style={{ marginTop: 'auto', paddingTop: '0.375rem' }}>
            <Meta post={post} />
          </div>
        </div>
      </article>
    </Link>
  )
}
