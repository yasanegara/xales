import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PostViewer from '@/components/PostViewer'
import LikeButton from '@/components/LikeButton'
import TableOfContents from '@/components/TableOfContents'
import BookmarkButton from '@/components/BookmarkButton'
import SaveButton from '@/components/SaveButton'
import ShareModal from '@/components/ShareModal'
import ReadingWrapper from '@/components/ReadingWrapper'
import TampilanButton from '@/components/TampilanButton'
import Paywall from '@/components/Paywall'
import RatingWidget from '@/components/RatingWidget'
import GiftPanel from '@/components/GiftPanel'
import CommentSection from '@/components/CommentSection'
import ViewTracker from './ViewTracker'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extractHeadings } from '@/lib/headings'
import { formatDate, readingTime } from '@/lib/utils'

type Props = { params: Promise<{ username: string; slug: string }>; searchParams: Promise<{ ref?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true, username: true } } },
  })
  if (!post) return { title: 'Post not found' }

  const authorName = post.author.name ?? `@${post.author.username}`
  const description = post.description ?? undefined
  const ogImageUrl = `/api/og/${slug}`

  return {
    title: post.title,
    description: description ?? post.title,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `/@${post.author.username}/${slug}`,
      authors: [authorName],
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function PostPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ref: refCode } = await searchParams
  const session = await getServerSession(authOptions)

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true, profilePic: true, bio: true, waNumber: true, waMessage: true } },
      files: { select: { id: true, name: true, mimeType: true, size: true, isFree: true, price: true, discount: true, url: true } },
    },
  })

  if (!post || !post.published) notFound()

  const isAuthor  = session?.user?.id === post.authorId
  const isMarkdown = post.type === 'markdown'

  // Private posts only accessible by author
  if (post.isPrivate && !isAuthor) notFound()
  let isPurchased = false
  if (post.isPremium && session && !isAuthor) {
    // Check direct purchase OR bundle purchase containing this post
    const [purchase, bundleAccess] = await Promise.all([
      db.purchase.findFirst({ where: { userId: session.user.id, postId: post.id, status: 'paid' } }),
      db.bundlePurchase.findFirst({
        where: {
          userId: session.user.id, status: 'paid',
          bundle: { items: { some: { postId: post.id } } },
        },
      }),
    ])
    isPurchased = !!(purchase || bundleAccess)
  }

  const canRead = !post.isPremium || isAuthor || isPurchased

  // Extract ?ref= from the request — passed via searchParams
  const headings  = isMarkdown && canRead ? extractHeadings(post.content) : []
  const authorName = post.author.name ?? `@${post.author.username}`

  // Gifts sent on this post (for GiftPanel initial data)
  const sentGifts = isMarkdown ? await db.sentGift.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: { select: { username: true, name: true, profilePic: true } },
      giftItem: true,
    },
  }) : []

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: post.type === 'html' ? '100%' : '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Post header */}
        <div style={{ maxWidth: isMarkdown ? '760px' : '100%', marginBottom: '2rem' }}>
          {/* Top bar: type + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
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

          {/* Author + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e0d8' }}>
            <Link
              href={`/@${post.author.username}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '7px',
                background: '#f0ede8', border: '1px solid #e5e0d8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 700, color: '#6e6a65',
                overflow: 'hidden', flexShrink: 0, position: 'relative',
              }}>
                {post.author.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.profilePic} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                ) : (
                  (post.author.name?.[0] ?? post.author.username[0]).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 500 }}>{authorName}</div>
                <div style={{ color: '#9c9690', fontSize: '0.75rem' }}>
                  {formatDate(post.publishedAt ?? post.createdAt)}
                  {isMarkdown && ` · ${readingTime(post.content)}`}
                </div>
              </div>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LikeButton slug={post.slug} initialCount={post.likeCount} />
              {isMarkdown && <BookmarkButton slug={post.slug} />}
              <SaveButton slug={post.slug} />
              <ShareModal
                slug={post.slug}
                title={post.title}
                description={post.description}
                authorName={authorName}
                authorUsername={post.author.username}
                coverImage={post.coverImage}
              />
              <span style={{ fontSize: '0.8125rem', color: '#9c9690' }}>👁 {post.viewCount.toLocaleString()}</span>
              {isMarkdown && <TampilanButton />}
              <ViewTracker slug={post.slug} />
            </div>
          </div>
        </div>

        {/* TOC */}
        {isMarkdown && headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}

        {/* Article body */}
        <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '2rem' }}>
          {canRead ? (
            <>
              <ReadingWrapper isMarkdown={isMarkdown}>
                <PostViewer type={post.type} content={post.content} title={post.title} />
              </ReadingWrapper>

              {/* File downloads for readers who have access */}
              {post.files.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f7f5f2', borderRadius: '10px', border: '1px solid #e5e0d8' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                    File Lampiran
                  </div>
                  {post.files.map((file) => (
                    <a
                      key={file.id}
                      href={`/api/files/${file.id}`}
                      download={file.name}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.75rem 1rem', textDecoration: 'none', marginBottom: '0.5rem' }}
                    >
                      <span>📎</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>{file.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                          {file.isFree ? 'Gratis' : 'Berbayar'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>↓ Unduh</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Paywall */
            <Paywall
              slug={post.slug}
              title={post.title}
              price={post.price!}
              authorName={authorName}
              authorUsername={post.author.username}
              authorWaNumber={post.author.waNumber}
              authorWaMessage={post.author.waMessage}
              refCode={refCode}
              files={post.files}
              isPurchased={false}
              preview={post.content?.slice(0, 600) ?? ''}
              postType={post.type}
              coverImage={post.coverImage}
            />
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{ background: '#f0ede8', border: '1px solid #e5e0d8', color: '#6e6a65', fontSize: '0.8125rem', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating + Gift row — only for articles */}
          {isMarkdown && (
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <RatingWidget postId={post.id} isAuthor={isAuthor} />
              <GiftPanel
                postId={post.id}
                isAuthor={isAuthor}
                isLoggedIn={!!session}
                initialGifts={sentGifts.map(g => ({ ...g, createdAt: g.createdAt.toISOString() }))}
              />
            </div>
          )}

          {/* Comment section — only for articles */}
          {isMarkdown && (
            <CommentSection
              postId={post.id}
              postAuthorId={post.authorId}
              currentUserId={session?.user?.username}
              isLoggedIn={!!session}
            />
          )}
        </div>
      </div>
    </>
  )
}
