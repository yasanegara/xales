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
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '10px',
          padding: '1.25rem',
          transition: 'border-color 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#333333')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#222222')}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
        >
          <span
            style={{
              background: post.type === 'html' ? '#1a2a1a' : '#1a1a2a',
              color: post.type === 'html' ? '#00c853' : '#0070f3',
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
            <span style={{ fontSize: '0.75rem', color: '#888888' }}>{post.category}</span>
          )}
        </div>

        <h2
          style={{
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: '#ffffff',
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
              color: '#888888',
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
                background: '#1a1a1a',
                border: '1px solid #222222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#888888',
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
            <span style={{ fontSize: '0.8rem', color: '#888888' }}>
              {post.author.name ?? `@${post.author.username}`}
            </span>
            <span style={{ color: '#333333' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: '#555555' }}>{formatDate(displayDate)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#555555' }}>
              👁 {post.viewCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#555555' }}>
              ♥ {post.likeCount.toLocaleString()}
            </span>
            {post.content && post.type === 'markdown' && (
              <span style={{ fontSize: '0.75rem', color: '#555555' }}>
                {readingTime(post.content)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
