'use client'

import Link from 'next/link'
import { formatDate, readingTime } from '@/lib/utils'

interface PostCardProps {
  post: {
    slug: string
    title: string
    description?: string | null
    type: string
    category?: string | null
    viewCount: number
    likeCount: number
    publishedAt?: Date | string | null
    createdAt: Date | string
    author: {
      username: string
      name?: string | null
      profilePic?: string | null
    }
    content?: string
  }
}

export default function PostCard({ post }: PostCardProps) {
  const displayDate = post.publishedAt ?? post.createdAt

  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <article
        style={{
          background: '#ffffff',
          border: '1px solid #e5e0d8',
          borderRadius: '10px',
          padding: '1.25rem',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = '#cfc9c0'
          el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = '#e5e0d8'
          el.style.boxShadow = 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span
            style={{
              background: post.type === 'html' ? '#ecfdf5' : '#eff6ff',
              color: post.type === 'html' ? '#059669' : '#2563eb',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {post.type === 'html' ? 'App' : 'Article'}
          </span>
          {post.category && (
            <span style={{ fontSize: '0.75rem', color: '#6e6a65' }}>{post.category}</span>
          )}
        </div>

        <h2
          style={{
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            lineHeight: 1.4,
          }}
        >
          {post.title}
        </h2>

        {post.description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6e6a65',
              marginBottom: '1rem',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.description}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#f0ede8',
                border: '1px solid #e5e0d8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#6e6a65',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {post.author.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.profilePic}
                  alt={post.author.name ?? post.author.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (post.author.name?.[0] ?? post.author.username[0]).toUpperCase()
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6e6a65' }}>
              {post.author.name ?? `@${post.author.username}`}
            </span>
            <span style={{ color: '#d0c9b8' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatDate(displayDate)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>
              👁 {post.viewCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>
              ♥ {post.likeCount.toLocaleString()}
            </span>
            {post.content && post.type === 'markdown' && (
              <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                {readingTime(post.content)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
