import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PostViewer from '@/components/PostViewer'
import LikeButton from '@/components/LikeButton'
import { db } from '@/lib/prisma'
import { formatDate, readingTime } from '@/lib/utils'

type Props = { params: Promise<{ username: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true, username: true } } },
  })
  if (!post) return { title: 'Post not found' }

  return {
    title: post.title,
    description: post.description ?? post.title,
    openGraph: {
      title: post.title,
      description: post.description ?? undefined,
      type: 'article',
      authors: [post.author.name ?? `@${post.author.username}`],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true, profilePic: true, bio: true } },
    },
  })

  if (!post || !post.published) notFound()

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: post.type === 'html' ? '100%' : '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span
              style={{
                background: post.type === 'html' ? '#1a2a1a' : '#1a1a2a',
                color: post.type === 'html' ? '#00c853' : '#0070f3',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {post.type === 'html' ? 'App' : 'Article'}
            </span>
            {post.category && (
              <span style={{ fontSize: '0.8125rem', color: '#888888' }}>{post.category}</span>
            )}
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.3,
              marginBottom: '1rem',
            }}
          >
            {post.title}
          </h1>

          {post.description && (
            <p style={{ color: '#888888', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {post.description}
            </p>
          )}

          {/* Author row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #222222',
            }}
          >
            <Link
              href={`/@${post.author.username}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  border: '1px solid #333333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#ededed',
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
              <div>
                <div style={{ color: '#ededed', fontSize: '0.875rem', fontWeight: 500 }}>
                  {post.author.name ?? `@${post.author.username}`}
                </div>
                <div style={{ color: '#555555', fontSize: '0.75rem' }}>
                  {formatDate(post.publishedAt ?? post.createdAt)}
                  {post.type === 'markdown' && ` · ${readingTime(post.content)}`}
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#555555' }}>
                👁 {post.viewCount.toLocaleString()}
              </span>
              <LikeButton slug={post.slug} initialCount={post.likeCount} />
              <ViewTracker slug={post.slug} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            borderTop: '1px solid #222222',
            paddingTop: '2rem',
          }}
        >
          <PostViewer type={post.type} content={post.content} title={post.title} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #222222',
                  color: '#888888',
                  fontSize: '0.8125rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

// Client component to fire view tracking on mount
function ViewTracker({ slug }: { slug: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var key = 'viewed_' + '${slug}';
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, '1');
              fetch('/api/posts/${slug}/view', { method: 'POST' });
            }
          })();
        `,
      }}
    />
  )
}
