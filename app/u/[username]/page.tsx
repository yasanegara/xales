import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import FollowButton from '@/components/FollowButton'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ProfileGrid from './ProfileGrid'

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
          category: true, coverImage: true, isPremium: true, price: true,
          viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
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

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '935px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'stretch', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '110px', minHeight: '140px', borderRadius: '16px',
            background: '#f0ede8', border: '1px solid #e5e0d8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 700, color: '#6e6a65',
            flexShrink: 0, overflow: 'hidden',
            position: 'relative',
          }}>
            {user.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePic}
                alt={user.name ?? username}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center center',
                  display: 'block',
                }}
              />
            ) : (
              (user.name?.[0] ?? username[0]).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#1a1a1a', margin: 0 }}>
                {username}
              </h1>
              <FollowButton username={username} />
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
              {[
                { label: 'post', value: user.posts.length },
                { label: 'pengikut', value: user._count.followers },
                { label: 'mengikuti', value: user._count.following },
              ].map(s => (
                <div key={s.label} style={{ fontSize: '0.9375rem', color: '#1a1a1a' }}>
                  <strong>{s.value.toLocaleString()}</strong>{' '}
                  <span style={{ color: '#6e6a65', fontWeight: 400 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Name + bio */}
            {user.name && (
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a', marginBottom: '0.2rem' }}>
                {user.name}
              </div>
            )}
            {user.status && (
              <div style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.2rem' }}>
                {user.status}
              </div>
            )}
            {user.bio && (
              <div style={{ fontSize: '0.9375rem', color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '0.2rem' }}>
                {user.bio}
              </div>
            )}
            <div style={{ fontSize: '0.8125rem', color: '#9c9690' }}>
              👁 {totalViews.toLocaleString()} views · ♥ {totalLikes.toLocaleString()} likes · Bergabung {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Bundles */}
        {user.bundles.length > 0 && (
          <section style={{ marginBottom: '2.5rem', borderTop: '1px solid #e5e0d8', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              🎁 Bundle
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {user.bundles.map(bundle => {
                const effectivePrice = bundle.discount
                  ? Math.round(bundle.price * (1 - bundle.discount / 100))
                  : bundle.price
                return (
                  <Link
                    key={bundle.id}
                    href={`/bundle/${bundle.slug}`}
                    style={{ display: 'block', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1rem', textDecoration: 'none' }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                      📦 {bundle.items.length} item
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.35rem', lineHeight: 1.4 }}>{bundle.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {bundle.discount && bundle.discount > 0 ? (
                        <>
                          <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Rp {formatIDR(effectivePrice)}</span>
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9c9690' }}>Rp {formatIDR(bundle.price)}</span>
                          <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>-{bundle.discount}%</span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Rp {formatIDR(bundle.price)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Posts grid */}
        <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '1rem' }}>
          {user.posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9c9690', padding: '4rem 0' }}>Belum ada konten.</p>
          ) : (
            <ProfileGrid posts={user.posts} username={username} />
          )}
        </div>
      </main>
    </>
  )
}
