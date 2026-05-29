export const dynamic = 'force-dynamic'

'use client'

import { useState, useEffect, useCallback } from 'react'
import type React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  slug: string
  title: string
  type: string
  published: boolean
  viewCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}

type Tab = 'all' | 'markdown' | 'html'

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/dashboard/posts')
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const togglePublish = async (slug: string, published: boolean) => {
    await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    fetchPosts()
  }

  const deletePost = async (slug: string) => {
    if (!confirm('Hapus post ini?')) return
    await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    fetchPosts()
  }

  const filtered = activeTab === 'all' ? posts : posts.filter((p) => p.type === activeTab)

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#1a1a1a' : '#6e6a65',
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${activeTab === tab ? '#1a1a1a' : 'transparent'}`,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s',
  })

  const counts = {
    all: posts.length,
    markdown: posts.filter((p) => p.type === 'markdown').length,
    html: posts.filter((p) => p.type === 'html').length,
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Posts</h1>
        <Link
          href="/dashboard/new"
          style={{ background: '#1a1a1a', color: '#f7f5f2', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
        >
          + New Post
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e0d8', marginBottom: '1rem' }}>
        {([['all', 'Semua'], ['markdown', 'Artikel'], ['html', 'Apps']] as [Tab, string][]).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
            {label}
            <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: activeTab === tab ? '#6e6a65' : '#9c9690' }}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto auto auto',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #e5e0d8',
            fontSize: '0.75rem',
            color: '#9c9690',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Judul</span><span>Type</span><span>Status</span><span>Views</span><span>Likes</span><span>Aksi</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>
            {posts.length === 0 ? (
              <></>
            ) : (
              <span>Tidak ada {activeTab === 'markdown' ? 'artikel' : 'apps'} yang dibuat.</span>
            )}
            {posts.length === 0 && (
              <>Belum ada post.{' '}<Link href="/dashboard/new" style={{ color: '#0070f3', textDecoration: 'none' }}>Buat sekarang</Link></>
            )}
          </div>
        ) : (
          filtered.map((post, i) => (
            <div
              key={post.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto auto auto',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < filtered.length - 1 ? '1px solid #f0ede8' : 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: '#1a1a1a', fontSize: '0.9375rem', fontWeight: 500 }}>{post.title}</div>
                <div style={{ color: '#9c9690', fontSize: '0.75rem', marginTop: '0.2rem' }}>{formatDate(post.updatedAt)}</div>
              </div>

              <span style={{ background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', color: post.type === 'html' ? '#059669' : '#2563eb', fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {post.type === 'html' ? 'App' : 'Article'}
              </span>

              <span style={{ fontSize: '0.75rem', color: post.published ? '#059669' : '#6e6a65', whiteSpace: 'nowrap' }}>
                {post.published ? '● Published' : '○ Draft'}
              </span>

              <span style={{ fontSize: '0.8125rem', color: '#6e6a65', whiteSpace: 'nowrap' }}>{post.viewCount.toLocaleString()}</span>
              <span style={{ fontSize: '0.8125rem', color: '#6e6a65', whiteSpace: 'nowrap' }}>{post.likeCount.toLocaleString()}</span>

              <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                {post.published && session?.user.username && (
                  <Link href={`/@${session.user.username}/${post.slug}`} style={{ fontSize: '0.8125rem', color: '#6e6a65', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                    Baca
                  </Link>
                )}
                <Link href={`/dashboard/edit/${post.slug}`} style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>Edit</Link>
                <button onClick={() => togglePublish(post.slug, post.published)} style={{ fontSize: '0.8125rem', color: post.published ? '#d97706' : '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deletePost(post.slug)} style={{ fontSize: '0.8125rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
