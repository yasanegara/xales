'use client'

import Link from 'next/link'
import { useState } from 'react'

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

function PostTile({ post, username }: { post: GridPost; username: string }) {
  const [hovered, setHovered] = useState(false)

  const bgColors: Record<string, string> = {
    markdown: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    html: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  }

  const typeLabel = post.type === 'html' ? 'App' : 'Article'
  const typeColor = post.type === 'html' ? '#059669' : '#2563eb'

  return (
    <Link
      href={`/@${username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', aspectRatio: '4/5', position: 'relative', overflow: 'hidden', borderRadius: '6px', background: '#f0ede8' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image or placeholder */}
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: bgColors[post.type] ?? '#f7f5f2',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '1rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {post.type === 'html' ? '🔗' : '📝'}
          </div>
          <div style={{
            fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {post.title}
          </div>
        </div>
      )}

      {/* Premium badge */}
      {post.isPremium && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'rgba(0,0,0,0.6)', color: '#fbbf24',
          fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem',
          borderRadius: '4px', letterSpacing: '0.04em',
        }}>
          PREMIUM
        </div>
      )}

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '1rem', textAlign: 'center',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: 700, color: typeColor,
          background: '#fff', borderRadius: '4px',
          padding: '0.1rem 0.4rem', letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: '0.5rem',
        }}>
          {typeLabel}
        </div>
        <div style={{
          fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4, marginBottom: '0.75rem',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
        }}>
          {post.title}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 500 }}>
            👁 {post.viewCount.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 500 }}>
            ♥ {post.likeCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ProfileGrid({ posts, username }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '4px',
    }}>
      {posts.map(post => (
        <PostTile key={post.id} post={post} username={username} />
      ))}
    </div>
  )
}
