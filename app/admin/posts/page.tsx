export const dynamic = 'force-dynamic'

import { db } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import AdminPostActions from './AdminPostActions'

export const metadata = { title: 'Posts · Admin · tweak' }

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const q = sp.q ?? ''
  const limit = 25

  const where = q
    ? { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { author: { username: { contains: q, mode: 'insensitive' as const } } }] }
    : {}

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: { select: { username: true, name: true } } },
    }),
    db.post.count({ where }),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Posts</h1>
          <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>{total} total posts</p>
        </div>
        <form style={{ display: 'flex', gap: '0.5rem' }}>
          <input name="q" defaultValue={q} placeholder="Cari judul atau username..." style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none', minWidth: '240px' }} />
          <button type="submit" style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>Cari</button>
        </form>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr auto auto auto auto auto', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #e5e0d8', fontSize: '0.75rem', color: '#9c9690', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Judul</span><span>Author</span><span>Type</span><span>Status</span><span>Views</span><span>Likes</span><span>Aksi</span>
        </div>

        {posts.map((post, i) => (
          <div key={post.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr auto auto auto auto auto', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: i < posts.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
            <div style={{ minWidth: 0 }}>
              <Link href={`/@${post.author.username}/${post.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
              </Link>
              <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatDate(post.createdAt)}</div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>@{post.author.username}</div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', color: post.type === 'html' ? '#059669' : '#2563eb', whiteSpace: 'nowrap' }}>
              {post.type === 'html' ? 'App' : 'Article'}
            </span>
            <span style={{ fontSize: '0.75rem', color: post.published ? '#059669' : '#9c9690', whiteSpace: 'nowrap' }}>
              {post.published ? '● Pub' : '○ Draft'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>{post.viewCount.toLocaleString()}</span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>{post.likeCount}</span>
            <AdminPostActions postId={post.id} slug={post.slug} published={post.published} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/admin/posts?page=${p}${q ? `&q=${q}` : ''}`}
              style={{ width: '36px', height: '36px', borderRadius: '6px', border: `1px solid ${page === p ? '#1a1a1a' : '#e5e0d8'}`, background: page === p ? '#1a1a1a' : '#ffffff', color: page === p ? '#f7f5f2' : '#6e6a65', fontSize: '0.875rem', cursor: 'pointer', fontWeight: page === p ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
