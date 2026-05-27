'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/dashboard/posts')
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>Posts</h1>
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

      <div
        style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto auto auto',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #222222',
            fontSize: '0.75rem',
            color: '#555555',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Judul</span>
          <span>Type</span>
          <span>Status</span>
          <span>Views</span>
          <span>Likes</span>
          <span>Aksi</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888888' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888888' }}>
            Belum ada post.{' '}
            <Link href="/dashboard/new" style={{ color: '#0070f3', textDecoration: 'none' }}>
              Buat sekarang
            </Link>
          </div>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto auto auto',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < posts.length - 1 ? '1px solid #1a1a1a' : 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: '#ededed', fontSize: '0.9375rem', fontWeight: 500 }}>
                  {post.title}
                </div>
                <div style={{ color: '#555555', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {formatDate(post.updatedAt)}
                </div>
              </div>

              <span
                style={{
                  background: post.type === 'html' ? '#1a2a1a' : '#1a1a2a',
                  color: post.type === 'html' ? '#00c853' : '#0070f3',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {post.type === 'html' ? 'App' : 'Article'}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: post.published ? '#00c853' : '#888888',
                  whiteSpace: 'nowrap',
                }}
              >
                {post.published ? '● Published' : '○ Draft'}
              </span>

              <span style={{ fontSize: '0.8125rem', color: '#888888', whiteSpace: 'nowrap' }}>
                {post.viewCount.toLocaleString()}
              </span>

              <span style={{ fontSize: '0.8125rem', color: '#888888', whiteSpace: 'nowrap' }}>
                {post.likeCount.toLocaleString()}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                <Link
                  href={`/dashboard/edit/${post.slug}`}
                  style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => togglePublish(post.slug, post.published)}
                  style={{
                    fontSize: '0.8125rem',
                    color: post.published ? '#ff8800' : '#00c853',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => deletePost(post.slug)}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#ff4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
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
