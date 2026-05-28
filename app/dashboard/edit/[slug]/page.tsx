'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PostEditor from '@/components/PostEditor'

interface Post {
  slug: string
  title: string
  description: string
  type: 'markdown' | 'html'
  content: string
  category: string
  tags: string[]
  published: boolean
}

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [form, setForm] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(async ({ slug: s }) => {
      setSlug(s)
      const res = await fetch(`/api/posts/${s}`)
      const data = await res.json()
      setForm({
        slug: data.slug,
        title: data.title ?? '',
        description: data.description ?? '',
        type: data.type,
        content: data.content ?? '',
        category: data.category ?? '',
        tags: data.tags ?? [],
        published: data.published,
      })
    })
  }, [params])

  const handleSubmit = async (published: boolean) => {
    if (!form) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, published }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/dashboard/posts')
    router.refresh()
  }

  if (!form) return <div style={{ color: '#6e6a65', padding: '4rem', textAlign: 'center' }}>Loading...</div>

  const inputStyle = { width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem' }}>Edit Post</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Judul *</label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ ...inputStyle, fontSize: '1.125rem', fontWeight: 600 }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Deskripsi</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Kategori</label>
          <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tags (pisah koma)</label>
          <input type="text" value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={labelStyle}>Konten *</label>
        <PostEditor type={form.type} value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => handleSubmit(false)} disabled={loading} style={{ background: '#ffffff', border: '1px solid #e5e0d8', color: '#1a1a1a', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          Save Draft
        </button>
        <button onClick={() => handleSubmit(true)} disabled={loading} style={{ background: '#1a1a1a', border: 'none', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : form.published ? 'Update' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
