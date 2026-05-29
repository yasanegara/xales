'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string; content: string; createdAt: string
  user: { username: string; name?: string | null; profilePic?: string | null }
}

interface Props {
  postId: string
  postAuthorId: string
  currentUserId?: string
  isLoggedIn: boolean
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'Baru saja'
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  if (s < 2592000) return `${Math.floor(s / 86400)} hari lalu`
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CommentSection({ postId, postAuthorId, currentUserId, isLoggedIn }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [posting, setPosting]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => { setComments(d); setLoading(false) })
  }, [postId])

  const submit = async () => {
    if (!content.trim() || posting) return
    setPosting(true); setError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content }),
    })
    const data = await res.json()
    setPosting(false)
    if (!res.ok) { setError(data.error); return }
    setComments(prev => [...prev, data])
    setContent('')
  }

  const del = async (id: string) => {
    if (!confirm('Hapus komentar ini?')) return
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #e5e0d8', paddingTop: '2rem' }}>
      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.5rem' }}>
        Diskusi <span style={{ fontWeight: 400, color: '#9c9690', fontSize: '0.9rem' }}>({comments.length})</span>
      </h2>

      {/* Comment form */}
      {isLoggedIn ? (
        <div style={{ marginBottom: '1.75rem' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Tulis komentar..."
            rows={3}
            style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9375rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1a1a1a' }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
          />
          {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: '0.375rem 0' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={submit} disabled={posting || !content.trim()}
              style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '7px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: posting || !content.trim() ? 'not-allowed' : 'pointer', opacity: posting || !content.trim() ? 0.6 : 1 }}>
              {posting ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '1.5rem' }}>
          <a href="/login" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 500 }}>Masuk</a> untuk ikut diskusi.
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div style={{ color: '#9c9690', fontSize: '0.875rem' }}>Memuat...</div>
      ) : comments.length === 0 ? (
        <p style={{ color: '#9c9690', fontSize: '0.875rem' }}>Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {comments.map(c => {
            const canDelete = currentUserId === c.user.username || currentUserId === postAuthorId
            const initial = (c.user.name?.[0] ?? c.user.username[0]).toUpperCase()
            return (
              <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                {/* Avatar */}
                <div style={{ width: 32, height: 32, borderRadius: '7px', background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#6e6a65' }}>
                  {c.user.profilePic
                    ? <img src={c.user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    : initial
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                      {c.user.name ?? `@${c.user.username}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{timeAgo(c.createdAt)}</span>
                    {canDelete && (
                      <button onClick={() => del(c.id)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9c9690', fontSize: '0.75rem', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                        Hapus
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: '#2d2420', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
