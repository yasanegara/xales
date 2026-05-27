import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!

  const posts = await db.post.findMany({
    where: { authorId: session!.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })

  const allPosts = await db.post.findMany({
    where: { authorId: session!.user.id },
  })

  const totalViews = allPosts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes = allPosts.reduce((s, p) => s + p.likeCount, 0)
  const published = allPosts.filter((p) => p.published).length

  const stats = [
    { label: 'Total Posts', value: allPosts.length },
    { label: 'Published', value: published },
    { label: 'Total Views', value: totalViews.toLocaleString() },
    { label: 'Total Likes', value: totalLikes.toLocaleString() },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>Dashboard</h1>
          <p style={{ color: '#888888', marginTop: '0.25rem' }}>
            Halo, {session!.user.name ?? `@${session!.user.username}`}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          style={{
            background: '#0070f3',
            color: '#fff',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#111111',
              border: '1px solid #222222',
              borderRadius: '10px',
              padding: '1.25rem',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#888888', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div
        style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #222222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ededed' }}>Post Terbaru</h2>
          <Link href="/dashboard/posts" style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888888' }}>
            <p style={{ marginBottom: '1rem' }}>Belum ada post.</p>
            <Link
              href="/dashboard/new"
              style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Buat post pertamamu →
            </Link>
          </div>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: i < posts.length - 1 ? '1px solid #1a1a1a' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  background: post.type === 'html' ? '#1a2a1a' : '#1a1a2a',
                  color: post.type === 'html' ? '#00c853' : '#0070f3',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}
              >
                {post.type === 'html' ? 'App' : 'Article'}
              </span>
              <span style={{ flex: 1, color: '#ededed', fontSize: '0.9375rem', fontWeight: 500 }}>
                {post.title}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: post.published ? '#00c853' : '#888888',
                  flexShrink: 0,
                }}
              >
                {post.published ? 'Published' : 'Draft'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#555555', flexShrink: 0 }}>
                👁 {post.viewCount} · ♥ {post.likeCount}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#555555', flexShrink: 0 }}>
                {formatDate(post.updatedAt)}
              </span>
              <Link
                href={`/dashboard/edit/${post.slug}`}
                style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none', flexShrink: 0 }}
              >
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
