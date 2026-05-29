import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { db } from '@/lib/prisma'
import ProfileHeader from './ProfileHeader'
import ProfileGrid from './ProfileGrid'

type Props = { params: Promise<{ username: string }> }

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID').format(n) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await db.user.findUnique({ where: { username } })
  if (!user) return { title: 'User not found' }
  return {
    title: user.name ?? `@${username}`,
    description: user.bio ?? `Posts by @${username} on tweak`,
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
        select: {
          id: true, slug: true, title: true, description: true,
          price: true, discount: true, items: { select: { id: true } },
        },
      },
      _count: { select: { followers: true, following: true } },
    },
  })

  if (!user) notFound()

  const totalViews = user.posts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes = user.posts.reduce((s, p) => s + p.likeCount, 0)
  const reputationScore = Math.floor(
    user.posts.length * 20 +
    totalViews / 10 +
    totalLikes * 5 +
    user._count.followers * 10
  )

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '935px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        <ProfileHeader
          username={user.username}
          name={user.name}
          profilePic={user.profilePic}
          bio={user.bio}
          status={user.status}
          createdAt={user.createdAt.toISOString()}
          postCount={user.posts.length}
          followers={user._count.followers}
          following={user._count.following}
          totalViews={totalViews}
          totalLikes={totalLikes}
          verified={user.verified}
          reputationScore={reputationScore}
        />

        {/* Bundles */}
        {user.bundles.length > 0 && (
          <section style={{ marginBottom: '2rem', borderTop: '1px solid #e5e0d8', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              🎁 Bundle
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
              {user.bundles.map(bundle => {
                const effectivePrice = bundle.discount
                  ? Math.round(bundle.price * (1 - bundle.discount / 100))
                  : bundle.price
                return (
                  <Link
                    key={bundle.id}
                    href={`/bundle/${bundle.slug}`}
                    style={{ display: 'block', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '0.875rem', textDecoration: 'none' }}
                  >
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                      📦 {bundle.items.length} item
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.3rem', lineHeight: 1.4 }}>{bundle.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {bundle.discount && bundle.discount > 0 ? (
                        <>
                          <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.8125rem' }}>Rp {formatIDR(effectivePrice)}</span>
                          <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: '#9c9690' }}>Rp {formatIDR(bundle.price)}</span>
                          <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px', padding: '0.1rem 0.3rem', fontWeight: 600 }}>-{bundle.discount}%</span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.8125rem' }}>Rp {formatIDR(bundle.price)}</span>
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
            <ProfileGrid posts={user.posts} username={user.username} />
          )}
        </div>
      </main>
    </>
  )
}
