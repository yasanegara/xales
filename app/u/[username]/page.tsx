import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await db.user.findUnique({ where: { username } })
  if (!user) return { title: 'User not found' }
  return { title: user.name ?? `@${username}`, description: user.bio ?? `Posts by @${username} on XALES` }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  const user = await db.user.findUnique({
    where: { username },
    include: { posts: { where: { published: true }, orderBy: { publishedAt: 'desc' } } },
  })

  if (!user) notFound()

  const totalViews = user.posts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes = user.posts.reduce((s, p) => s + p.likeCount, 0)

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e0d8',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#f0ede8', border: '2px solid #e5e0d8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, color: '#6e6a65',
              flexShrink: 0, overflow: 'hidden',
            }}
          >
            {user.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePic} alt={user.name ?? username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user.name?.[0] ?? username[0]).toUpperCase()
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
              {user.name ?? `@${username}`}
            </h1>
            <p style={{ color: '#6e6a65', fontSize: '0.875rem', marginBottom: '0.75rem' }}>@{username}</p>
            {user.status && (
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#6e6a65', fontSize: '0.875rem', background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '20px', padding: '0.25rem 0.75rem', marginBottom: '0.75rem' }}>
                <span>·</span> {user.status}
              </p>
            )}
            {user.bio && <p style={{ color: '#3d3a36', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{user.bio}</p>}
            <p style={{ color: '#9c9690', fontSize: '0.8125rem' }}>Bergabung {formatDate(user.createdAt)}</p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
            {[
              { label: 'Posts', value: user.posts.length },
              { label: 'Views', value: totalViews.toLocaleString() },
              { label: 'Likes', value: totalLikes.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6e6a65' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {user.posts.length === 0 ? (
          <p style={{ color: '#6e6a65', textAlign: 'center', padding: '3rem 0' }}>Belum ada post yang dipublish.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, author: { username: user.username, name: user.name, profilePic: user.profilePic } }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
