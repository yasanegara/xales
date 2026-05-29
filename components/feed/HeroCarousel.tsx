'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import type { FeedPost } from './FeedCard'

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: bg, color, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
      {children}
    </span>
  )
}

export default function HeroCarousel({ posts }: { posts: FeedPost[] }) {
  const [idx, setIdx]           = useState(0)
  const [dragDelta, setDelta]   = useState(0)
  const [isDragging, setDrag]   = useState(false)
  const startXRef               = useRef(0)
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null)
  const n = posts.length

  const go = (i: number) => setIdx((i + n) % n)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % n), 5000)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [n])

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    setDrag(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setDelta(e.touches[0].clientX - startXRef.current)
  }
  const onTouchEnd = () => {
    if (dragDelta < -50) go(idx + 1)
    else if (dragDelta > 50) go(idx - 1)
    setDelta(0); setDrag(false); startTimer()
  }

  if (!posts.length) return null

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: 'clamp(260px, 42vw, 420px)', touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        <div style={{
          display: 'flex', height: '100%',
          transform: `translateX(calc(${-idx * 100}% + ${dragDelta}px))`,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}>
          {posts.map((post, i) => {
            const isApp = post.type === 'html'
            const fallback = isApp
              ? 'linear-gradient(145deg, #1e3a5f, #0f2340)'
              : 'linear-gradient(145deg, #2d1b0e, #1a0f07)'
            return (
              <Link key={post.id}
                href={`/@${post.author.username}/${post.slug}`}
                draggable={false}
                style={{ flex: '0 0 100%', position: 'relative', display: 'block', textDecoration: 'none', userSelect: 'none' }}
                onClick={e => { if (Math.abs(dragDelta) > 10) e.preventDefault() }}
              >
                {/* Cover */}
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title}
                    loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
                    draggable={false}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: fallback }} />
                )}

                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.08) 100%)' }} />

                {/* Content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
                    <Badge bg={isApp ? '#065f46' : '#1e40af'} color="#fff">{isApp ? 'App' : 'Artikel'}</Badge>
                    {post.isPremium && <Badge bg="#b45309" color="#fef3c7">Premium</Badge>}
                    {post.category && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{post.category}</span>}
                  </div>
                  <h2 style={{
                    fontSize: 'clamp(1.1rem, 3vw, 1.625rem)', fontWeight: 700,
                    color: '#fff', lineHeight: 1.3, margin: '0 0 0.625rem',
                    fontFamily: 'Georgia, serif', letterSpacing: '-0.01em',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                  }}>
                    {post.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{post.author.name ?? `@${post.author.username}`}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                    <span>·</span>
                    <span>👁 {post.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Prev / Next arrows — desktop only */}
        {n > 1 && (
          <>
            <button onClick={() => { go(idx - 1); startTimer() }}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              ‹
            </button>
            <button onClick={() => { go(idx + 1); startTimer() }}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.625rem' }}>
          {posts.map((_, i) => (
            <button key={i} onClick={() => { go(i); startTimer() }}
              style={{ width: i === idx ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? '#1a1a1a' : '#d5c9b0', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.25s ease' }} />
          ))}
        </div>
      )}
    </div>
  )
}
