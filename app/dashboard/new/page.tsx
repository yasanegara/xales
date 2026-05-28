'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostEditor from '@/components/PostEditor'

export default function NewPostPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'markdown' as 'markdown' | 'html',
    content: '',
    category: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (published: boolean) => {
    if (!form.title || !form.content) { setError('Title dan konten wajib diisi'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(published ? `/@${session?.user.username}/${data.slug}` : '/dashboard/posts')
    router.refresh()
  }

  const inputStyle = {
    width: '100%',
    background: '#fafaf8',
    border: '1px solid #e5e0d8',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#1a1a1a',
    fontSize: '0.9375rem',
    outline: 'none',
  }
  const labelStyle = { display: 'block' as const, fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem' }}>New Post</h1>

      {/* Type selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(['markdown', 'html'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: `1px solid ${form.type === t ? '#1a1a1a' : '#e5e0d8'}`,
                background: form.type === t ? '#1a1a1a' : '#ffffff',
                color: form.type === t ? '#f7f5f2' : '#6e6a65',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {t === 'markdown' ? '📝 Artikel (Markdown)' : '🛠 Web App (HTML)'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Judul *</label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ ...inputStyle, fontSize: '1.125rem', fontWeight: 600 }} placeholder="Judul yang menarik..." />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Deskripsi</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} placeholder="Ringkasan singkat (tampil di feed)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Kategori</label>
          <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle} placeholder="Tech, Tutorial, Finance..." />
        </div>
        <div>
          <label style={labelStyle}>Tags (pisah koma)</label>
          <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={inputStyle} placeholder="javascript, webdev, tips" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={labelStyle}>Konten *</label>
        <PostEditor type={form.type} value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => handleSubmit(false)} disabled={loading}
          style={{ background: '#ffffff', border: '1px solid #e5e0d8', color: '#1a1a1a', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '...' : 'Save Draft'}
        </button>
        <button onClick={() => handleSubmit(true)} disabled={loading}
          style={{ background: '#1a1a1a', border: 'none', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
