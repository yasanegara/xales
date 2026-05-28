import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PostViewer from '@/components/PostViewer'
import LikeButton from '@/components/LikeButton'
import TableOfContents from '@/components/TableOfContents'
import BookmarkButton from '@/components/BookmarkButton'
import ViewTracker from './ViewTracker'
import { db } from '@/lib/prisma'
import { extractHeadings } from '@/lib/headings'
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
    include: { author: { select: { username: true, name: true, profilePic: true, bio: true } } },
  })

  if (!post || !post.published) notFound()

  const headings = post.type === 'markdown' ? extractHeadings(post.content) : []
  const isMarkdown = post.type === 'markdown'

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: post.type === 'html' ? '100%' : '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Post header — full width */}
        <div style={{ maxWidth: isMarkdown ? '760px' : '100%', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span
              style={{
                background: post.type === 'html' ? '#ecfdf5' : '#eff6ff',
                color: post.type === 'html' ? '#059669' : '#2563eb',
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
              <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>{post.category}</span>
            )}
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              lineHeight: 1.3,
              marginBottom: '1rem',
            }}
          >
            {post.title}
          </h1>

          {post.description && (
            <p style={{ color: '#6e6a65', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {post.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e0d8',
            }}
          >
            <Link
              href={`/@${post.author.username}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#f0ede8', border: '1px solid #e5e0d8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: '#6e6a65',
                  overflow: 'hidden', flexShrink: 0,
                }}
              >
                {post.author.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.profilePic} alt={post.author.name ?? post.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (post.author.name?.[0] ?? post.author.username[0]).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 500 }}>
                  {post.author.name ?? `@${post.author.username}`}
                </div>
                <div style={{ color: '#9c9690', fontSize: '0.75rem' }}>
                  {formatDate(post.publishedAt ?? post.createdAt)}
                  {isMarkdown && ` · ${readingTime(post.content)}`}
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', color: '#9c9690' }}>👁 {post.viewCount.toLocaleString()}</span>
              <LikeButton slug={post.slug} initialCount={post.likeCount} />
              {isMarkdown && <BookmarkButton slug={post.slug} />}
              <ViewTracker slug={post.slug} />
            </div>
          </div>
        </div>

        {/* TOC — fixed overlay drawer (only for markdown) */}
        {isMarkdown && headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}

        {/* Article body — always full width */}
        <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '2rem' }}>
          <PostViewer type={post.type} content={post.content} title={post.title} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: '#f0ede8', border: '1px solid #e5e0d8', color: '#6e6a65',
                    fontSize: '0.8125rem', padding: '0.25rem 0.75rem', borderRadius: '20px',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
