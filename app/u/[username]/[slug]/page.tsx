export const dynamic = 'force-dynamic'

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
import AppShareButton from '@/components/AppShareButton'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extractHeadings } from '@/lib/headings'
import { formatDate, readingTime } from '@/lib/utils'
import { getBaseUrl } from '@/lib/base-url'

// Pre-render top 100 articles at build time (graceful fallback if DB unreachable)
export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({
      where: { published: true, isPrivate: false },
      orderBy: { viewCount: 'desc' },
      take: 100,
      select: { slug: true, author: { select: { username: true } } },
    })
    return posts.map(p => ({ username: p.author.username, slug: p.slug }))
  } catch {
    return [] // DB unreachable at build time (Railway build phase) — pages generated on-demand via ISR
  }
}

type Props = { params: Promise<{ username: string; slug: string }>; searchParams: Promise<{ ref?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  const BASE_URL = await getBaseUrl()
  const post = await db.post.findUnique({
    where: { slug },
    select: { title: true, description: true, coverImage: true, tags: true, publishedAt: true, author: { select: { name: true, username: true } } },
  })
  if (!post) return { title: 'Post not found' }

  const authorName = post.author.name ?? `@${post.author.username}`
  const description = post.description ?? undefined
  const isUrl = post.coverImage?.startsWith('http')
  const ogImage = isUrl ? post.coverImage! : `${BASE_URL}/api/og/${slug}`
  const canonical = `${BASE_URL}/@${username}/${slug}`

  return {
    title: post.title,
    description: description ?? post.title,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical },
    keywords: post.tags,
    authors: [{ name: authorName }],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: canonical,
      authors: [authorName],
      publishedTime: post.publishedAt?.toISOString(),
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PostPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ref: refCode } = await searchParams
  const [session, BASE_URL] = await Promise.all([getServerSession(authOptions), getBaseUrl()])

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true, profilePic: true, bio: true, waNumber: true, waMessage: true } },
      files: { select: { id: true, name: true, mimeType: true, size: true, isFree: true, price: true, discount: true, url: true } },
    },
  })

  if (!post || !post.published) notFound()

  const isAuthor   = session?.user?.id === post.authorId
  const isMarkdown = post.type === 'markdown'

  // Private posts only accessible by author
  if (post.isPrivate && !isAuthor) notFound()

  // Run purchase check + related posts + gifts in parallel
  const needsPurchaseCheck = post.isPremium && !!session && !isAuthor
  const [purchaseResults, relatedPosts, sentGifts] = await Promise.all([
    needsPurchaseCheck
      ? Promise.all([
          db.purchase.findFirst({ where: { userId: session!.user.id, postId: post.id, status: 'paid' } }),
          db.bundlePurchase.findFirst({
            where: {
              userId: session!.user.id, status: 'paid',
              bundle: { items: { some: { postId: post.id } } },
            },
          }),
        ])
      : Promise.resolve([null, null] as [null, null]),
    isMarkdown ? db.post.findMany({
      where: {
        published: true, isPrivate: false, id: { not: post.id },
        OR: [
          ...(post.tags.length > 0 ? [{ tags: { hasSome: post.tags } }] : []),
          ...(post.category ? [{ category: post.category }] : []),
          { authorId: post.authorId },
        ],
      },
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: {
        id: true, slug: true, title: true, type: true,
        coverImage: true, isPremium: true, viewCount: true,
        publishedAt: true, createdAt: true,
        author: { select: { username: true, name: true } },
      },
    }) : Promise.resolve([]),
    isMarkdown ? db.sentGift.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: { select: { username: true, name: true, profilePic: true } },
        giftItem: true,
      },
    }) : Promise.resolve([]),
  ])

  const isPurchased = needsPurchaseCheck ? !!(purchaseResults[0] || purchaseResults[1]) : false
  const canRead     = !post.isPremium || isAuthor || isPurchased
  const authorName  = post.author.name ?? `@${post.author.username}`
  const headings    = isMarkdown && canRead ? extractHeadings(post.content) : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'html' ? 'SoftwareApplication' : 'Article',
    headline: post.title,
    description: post.description ?? post.title,
    author: { '@type': 'Person', name: post.author.name ?? post.author.username, url: `${BASE_URL}/@${post.author.username}` },
    publisher: { '@type': 'Organization', name: 'Tweak', url: BASE_URL },
    url: `${BASE_URL}/@${post.author.username}/${slug}`,
    ...(post.coverImage?.startsWith('http') ? { image: post.coverImage } : {}),
  }

  // Login gate — all content requires login (author exempt)
  if (!session && !isAuthor) {
    const postUrl = `/@${post.author.username}/${slug}`
    return (
      <>
        <Navbar />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="article-container">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', color: post.type === 'html' ? '#059669' : '#2563eb', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {post.type === 'html' ? 'App' : 'Article'}
              </span>
              {post.category && <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>{post.category}</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1a1a', lineHeight: 1.3, marginBottom: '0.875rem' }}>
              {post.title}
            </h1>
            {post.description && (
              <p style={{ color: '#6e6a65', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {post.description}
              </p>
            )}
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '10px', marginBottom: '1.5rem' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e0d8' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#f0ede8', border: '1px solid #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#6e6a65', overflow: 'hidden', flexShrink: 0 }}>
                {post.author.profilePic
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={post.author.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (post.author.name?.[0] ?? post.author.username[0]).toUpperCase()
                }
              </div>
              <span style={{ fontSize: '0.875rem', color: '#1a1a1a', fontWeight: 500 }}>{authorName}</span>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(150deg, #faf7f2 0%, #ede8e0 100%)', border: '1px solid #e5e0d8', borderRadius: '14px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.625rem' }}>
              Masuk untuk {post.type === 'html' ? 'menjalankan app' : 'membaca artikel'} ini
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6e6a65', lineHeight: 1.6, marginBottom: '2rem' }}>
              Tweak adalah platform untuk kreator berbagi artikel dan web app.<br />
              Buat akun gratis dan akses ribuan konten menarik.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/login?from=${encodeURIComponent(postUrl)}`} style={{ display: 'inline-block', background: '#1a1a1a', color: '#f7f5f2', fontWeight: 600, fontSize: '0.9375rem', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none' }}>Masuk</a>
              <a href={`/register?from=${encodeURIComponent(postUrl)}`} style={{ display: 'inline-block', background: '#ffffff', color: '#1a1a1a', fontWeight: 600, fontSize: '0.9375rem', padding: '0.75rem 2rem', borderRadius: '8px', border: '1px solid #e5e0d8', textDecoration: 'none' }}>Daftar gratis</a>
            </div>
          </div>
        </div>
      </>
    )
  }

  // App type: full-screen iframe, no platform chrome
  if (post.type === 'html' && canRead) {
    return (
      <>
        <ViewTracker slug={post.slug} />
        {/* Thin floating back bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e5e0d8',
        }}>
          <Link href="/" style={{ fontSize: '0.8125rem', color: '#6e6a65', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            ← Tweak
          </Link>
          <span style={{ color: '#e5e0d8' }}>·</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>by {authorName}</span>
            <AppShareButton
              title={post.title}
              slug={slug}
              authorUsername={post.author.username}
              affiliateEnabled={post.affiliateEnabled}
              affiliateRate={post.affiliateRate}
            />
          </div>
        </div>
        <div style={{ paddingTop: '37px' }}>
          <PostViewer type={post.type} content={post.content} title={post.title} />
        </div>
      </>
    )
  }

  // App type with paywall
  if (post.type === 'html' && !canRead) {
    return (
      <>
        <Navbar />
        <div className="article-container">
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1a1a', marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <Paywall
            slug={post.slug} title={post.title} price={post.price!}
            authorName={authorName} authorUsername={post.author.username}
            authorWaNumber={post.author.waNumber} authorWaMessage={post.author.waMessage}
            refCode={refCode} files={post.files} isPurchased={false}
            preview={post.content?.slice(0, 600) ?? ''} postType={post.type} coverImage={post.coverImage}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

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
                  {post.files.map((file) => {
                    const isLink = file.url && (file.mimeType === 'url/link' || file.url.startsWith('http'))
                    return (
                      <a
                        key={file.id}
                        href={isLink ? file.url! : `/api/files/${file.id}`}
                        {...(isLink ? { target: '_blank', rel: 'noopener noreferrer' } : { download: file.name })}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.75rem 1rem', textDecoration: 'none', marginBottom: '0.5rem', transition: 'border-color 0.15s' }}
                      >
                        <span>{isLink ? '🔗' : '📎'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>{file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                            {isLink ? 'Akses eksternal' : file.isFree ? 'Gratis' : 'Berbayar'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: isLink ? '#0070f3' : '#059669' }}>
                          {isLink ? '↗ Buka' : '↓ Unduh'}
                        </span>
                      </a>
                    )
                  })}
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

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e0d8', maxWidth: '760px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c9690', marginBottom: '1.25rem' }}>
                Artikel Terkait
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {relatedPosts.map((rp) => {
                  const rpAuthor = rp.author.name ?? `@${rp.author.username}`
                  return (
                    <Link
                      key={rp.id}
                      href={`/@${rp.author.username}/${rp.slug}`}
                      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '0.875rem', background: '#f7f5f2', borderRadius: '10px', border: '1px solid #e5e0d8', transition: 'border-color 0.15s' }}
                    >
                      {rp.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rp.coverImage}
                          alt={rp.title}
                          loading="lazy"
                          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {rp.title}
                        </div>
                        <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#9c9690', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span>{rpAuthor}</span>
                          <span>·</span>
                          <span>👁 {rp.viewCount.toLocaleString()}</span>
                          {rp.isPremium && <span style={{ color: '#b45309', fontWeight: 600 }}>★</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
