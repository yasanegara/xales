import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Library · XALES' }

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)

  const saved = await db.savedPost.findMany({
    where: { userId: session!.user.id },
    orderBy: { savedAt: 'desc' },
    include: {
      post: {
        include: {
          author: { select: { username: true, name: true } },
        },
      },
    },
  })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Library</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem' }}>
          {saved.length > 0 ? `${saved.length} artikel tersimpan` : 'Artikel yang kamu koleksi'}
        </p>
      </div>

      {saved.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e0d8',
            borderRadius: '10px',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#6e6a65',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '0.5rem' }}>Library masih kosong</p>
          <p style={{ fontSize: '0.875rem' }}>
            Klik tombol <strong>☆ Simpan</strong> di artikel manapun untuk menambahkannya ke sini.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: '#1a1a1a',
              fontSize: '0.875rem',
              textDecoration: 'none',
              border: '1px solid #e5e0d8',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              background: '#f7f5f2',
            }}
          >
            Jelajahi artikel →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {saved.map(({ post, savedAt }) => (
            <div
              key={post.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e0d8',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span
                    style={{
                      background: post.type === 'html' ? '#ecfdf5' : '#eff6ff',
                      color: post.type === 'html' ? '#059669' : '#2563eb',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {post.type === 'html' ? 'App' : 'Article'}
                  </span>
                  {post.category && (
                    <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{post.category}</span>
                  )}
                </div>

                <Link href={`/@${post.author.username}/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      lineHeight: 1.4,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {post.title}
                  </h3>
                </Link>

                {post.description && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#6e6a65',
                      lineHeight: 1.5,
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.description}
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: '#9c9690', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span>oleh {post.author.name ?? `@${post.author.username}`}</span>
                  <span>·</span>
                  <span>Disimpan {formatDate(savedAt)}</span>
                  <span>·</span>
                  <span>👁 {post.viewCount.toLocaleString()} · ♥ {post.likeCount}</span>
                </div>
              </div>

              <Link
                href={`/@${post.author.username}/${post.slug}`}
                style={{
                  flexShrink: 0,
                  fontSize: '0.8125rem',
                  color: '#6e6a65',
                  textDecoration: 'none',
                  border: '1px solid #e5e0d8',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  background: '#f7f5f2',
                  whiteSpace: 'nowrap',
                }}
              >
                Baca →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
