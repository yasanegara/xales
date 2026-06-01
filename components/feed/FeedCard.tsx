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
      overflow: 'hidden',
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

// ─── Discover card (Gumroad-style) ───────────────────────────────────────
export function DiscoverCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const fallback = isApp
    ? 'linear-gradient(145deg, #1e3a5f, #0f2340)'
    : 'linear-gradient(145deg, #2d1b0e, #1a0f07)'
  const authorName = post.author.name ?? `@${post.author.username}`

  return (
    <Link href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: '#ffffff',
        border: `1px solid ${hovered ? '#c8c0b4' : '#e5e0d8'}`,
        borderRadius: '10px', overflow: 'hidden',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}>
        {/* Cover 1:1 */}
        <div style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', background: fallback }}>
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
          )}
          {!post.coverImage && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.18 }}>{isApp ? '⬡' : '✦'}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '0.875rem 0.875rem 0.75rem' }}>
          <h3 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a',
            lineHeight: 1.4, margin: '0 0 0.5rem',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </h3>

          {/* Creator row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.625rem' }}>
            <Avatar author={post.author} size={18} />
            <span style={{ fontSize: '0.75rem', color: '#6e6a65', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authorName}
            </span>
          </div>

          {/* Price + type row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.8125rem', fontWeight: 700,
              color: post.isPremium ? '#1a1a1a' : '#059669',
            }}>
              {post.isPremium
                ? post.price ? `Rp ${post.price.toLocaleString('id-ID')}` : 'Premium'
                : 'Gratis'}
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isApp ? '#059669' : '#2563eb',
              background: isApp ? '#ecfdf5' : '#eff6ff',
              padding: '0.15rem 0.5rem', borderRadius: '4px',
            }}>
              {isApp ? 'App' : 'Artikel'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Grid card (2-column, 16:9 cover) ────────────────────────────────────
export function GridCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp  = post.type === 'html'
  const fallback = isApp
    ? 'linear-gradient(145deg, #1e3a5f, #0f2340)'
    : 'linear-gradient(145deg, #2d1b0e, #1a0f07)'

  return (
    <Link href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: '#ffffff',
        border: `1px solid ${hovered ? '#c8c0b4' : '#e5e0d8'}`,
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: hovered ? '0 6px 24px rgba(0,0,0,0.09)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        {/* Cover 16:9 */}
        <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: fallback, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', opacity: 0.2 }}>{isApp ? '⬡' : '✦'}</span>
            </div>
          )}
          {/* Type badge */}
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.3rem' }}>
            <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
            {post.isPremium && <Badge bg="#b45309" color="#fef3c7">★</Badge>}
          </div>
        </div>

        {/* Text */}
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{
            fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a',
            lineHeight: 1.4, margin: '0 0 0.375rem',
            fontFamily: 'Georgia, serif',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: '#9c9690' }}>
            <Avatar author={post.author} size={16} />
            <span style={{ color: '#6e6a65', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
              {post.author.name ?? `@${post.author.username}`}
            </span>
            <span style={{ flexShrink: 0 }}>· 👁 {post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Full card (Instagram-style, one per screen) ──────────────────────────
export function FullCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp  = post.type === 'html'
  const date   = post.publishedAt ?? post.createdAt
  const fallback = isApp
    ? 'linear-gradient(145deg, #1e3a5f 0%, #0f2340 100%)'
    : 'linear-gradient(145deg, #2d1b0e 0%, #1a0f07 100%)'

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: '#ffffff',
        border: `1px solid ${hovered ? '#c8c0b4' : '#e5e0d8'}`,
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        height: 'clamp(500px, calc(100svh - 88px), 760px)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Cover — fills remaining space */}
        <div style={{ flex: '1 1 0', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              loading="lazy"
              decoding="async"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                transform: hovered ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: fallback, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3.5rem', opacity: 0.25 }}>{isApp ? '⬡' : '✦'}</span>
            </div>
          )}

          {/* Top badges */}
          <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem', display: 'flex', gap: '0.35rem' }}>
            <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
            {post.isPremium && <PremiumBadge />}
          </div>

          {/* Category */}
          {post.category && (
            <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
              <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.625rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{ flexShrink: 0, padding: '1.125rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Title */}
          <h2 style={{
            fontSize: 'clamp(1.0625rem, 2.5vw, 1.3125rem)',
            fontWeight: 700, color: '#1a1a1a',
            lineHeight: 1.35, fontFamily: 'Georgia, serif',
            letterSpacing: '-0.01em', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </h2>

          {/* Description / excerpt */}
          {post.description && (
            <p style={{
              fontSize: '0.875rem', color: '#6e6a65',
              lineHeight: 1.6, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
            }}>
              {post.description}
            </p>
          )}

          {/* Author + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
            <Avatar author={post.author} size={22} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1a1a1a' }}>
              {post.author.name ?? `@${post.author.username}`}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>· {formatDate(date)}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9c9690' }}>
              👁 {post.viewCount.toLocaleString()}
            </span>
            {post.likeCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>· ♥ {post.likeCount.toLocaleString()}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── List card (kept for possible reuse) ─────────────────────────────────
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#9c9690' }}>
            <Avatar author={post.author} size={20} />
            <span style={{ color: '#6e6a65', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span>·</span>
            <span>👁 {post.viewCount.toLocaleString()}</span>
          </div>
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
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.12) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.625rem' }}>
          <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
          {post.isPremium && <PremiumBadge />}
        </div>
        <h2 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: '0.75rem', fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {post.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', flexWrap: 'wrap' }}>
          <Avatar author={post.author} size={20} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
          <span>·</span>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>·</span>
          <span>👁 {post.viewCount.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Medium card ──────────────────────────────────────────────────────────
export function MediumCard({ post }: { post: FeedPost }) {
  const [hovered, setHovered] = useState(false)
  const isApp = post.type === 'html'
  const fallbackGrad = isApp ? 'linear-gradient(145deg, #1e3a5f, #0f2340)' : 'linear-gradient(145deg, #3d1a0f, #1e0d07)'

  return (
    <Link href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', position: 'relative', flex: 1, minHeight: '140px' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
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

// ─── Article card ─────────────────────────────────────────────────────────
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
          </div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#9c9690', flexWrap: 'wrap' }}>
          <Avatar author={post.author} size={20} />
          <span style={{ color: '#6e6a65', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
          <span>·</span>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>·</span>
          <span>👁 {post.viewCount.toLocaleString()}</span>
        </div>
      </article>
    </Link>
  )
}

// ─── App card ─────────────────────────────────────────────────────────────
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
            ? <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
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
          <div style={{ marginTop: 'auto', paddingTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#9c9690', flexWrap: 'wrap' }}>
            <Avatar author={post.author} size={20} />
            <span style={{ color: '#6e6a65', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
            <span>·</span>
            <span>👁 {post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
