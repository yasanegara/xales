import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

type Props = { params: Promise<{ username: string }> }

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID').format(n) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await db.user.findUnique({ where: { username } })
  if (!user) return { title: 'User not found' }
  return {
    title: user.name ?? `@${username}`,
    description: user.bio ?? `Posts by @${username} on XALES`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  const user = await db.user.findUnique({
    where: { username },
    include: {
      posts: {
        where: { published: true, isPrivate: false },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, slug: true, title: true, description: true, type: true,
          category: true, tags: true, coverImage: true, isPremium: true, price: true,
          viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
          authorId: true,
        },
      },
      bundles: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, slug: true, title: true, description: true, price: true, discount: true, items: { select: { id: true } } },
      },
      _count: { select: { followers: true, following: true } },
    },
  })

  if (!user) notFound()

  const totalViews = user.posts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes = user.posts.reduce((s, p) => s + p.likeCount, 0)

  const articles = user.posts.filter(p => p.type === 'markdown')
  const apps = user.posts.filter(p => p.type === 'html')

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Profile card */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#f0ede8', border: '2px solid #e5e0d8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: '#6e6a65',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profilePic} alt={user.name ?? username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.name?.[0] ?? username[0]).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                  {user.name ?? `@${username}`}
                </h1>
                <FollowButton username={username} />
              </div>
              <p style={{ color: '#9c9690', fontSize: '0.875rem', marginBottom: '0.5rem' }}>@{username}</p>
              {user.status && (
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#6e6a65', fontSize: '0.875rem', background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '20px', padding: '0.2rem 0.7rem', marginBottom: '0.5rem' }}>
                  {user.status}
                </p>
              )}
              {user.bio && (
                <p style={{ color: '#3d3a36', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>{user.bio}</p>
              )}
              <p style={{ color: '#9c9690', fontSize: '0.8125rem' }}>Bergabung {formatDate(user.createdAt)}</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f0ede8', flexWrap: 'wrap' }}>
            {[
              { label: 'Post', value: user.posts.length },
              { label: 'Pengikut', value: user._count.followers.toLocaleString() },
              { label: 'Mengikuti', value: user._count.following.toLocaleString() },
              { label: 'Views', value: totalViews.toLocaleString() },
              { label: 'Likes', value: totalLikes.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundles section */}
        {user.bundles.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎁 Bundle
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
              {user.bundles.map(bundle => {
                const effectivePrice = bundle.discount
                  ? Math.round(bundle.price * (1 - bundle.discount / 100))
                  : bundle.price
                return (
                  <Link
                    key={bundle.id}
                    href={`/bundle/${bundle.slug}`}
                    style={{ display: 'block', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.125rem', textDecoration: 'none', transition: 'border-color 0.15s' }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      📦 {bundle.items.length} item
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.375rem', lineHeight: 1.4 }}>{bundle.title}</div>
                    {bundle.description && (
                      <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.625rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {bundle.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {bundle.discount && bundle.discount > 0 ? (
                        <>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(effectivePrice)}</span>
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9c9690' }}>Rp {formatIDR(bundle.price)}</span>
                          <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px', padding: '0.1rem 0.4rem', fontWeight: 600 }}>-{bundle.discount}%</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(bundle.price)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
              📝 Artikel ({articles.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {articles.map(post => (
                <PostCard
                  key={post.id}
                  post={{ ...post, author: { username: user.username, name: user.name, profilePic: user.profilePic } }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Apps */}
        {apps.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
              🔗 Apps ({apps.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {apps.map(post => (
                <PostCard
                  key={post.id}
                  post={{ ...post, author: { username: user.username, name: user.name, profilePic: user.profilePic } }}
                />
              ))}
            </div>
          </section>
        )}

        {user.posts.length === 0 && user.bundles.length === 0 && (
          <p style={{ color: '#9c9690', textAlign: 'center', padding: '4rem 0' }}>Belum ada konten yang dipublish.</p>
        )}
      </main>
    </>
  )
}
