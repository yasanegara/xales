'use client'

import { useState, useEffect } from 'react'

interface PostOption { id: string; title: string; slug: string; type: string }
interface FileOption { id: string; name: string; mimeType: string; postTitle: string }
interface SelectedItem { postId?: string; fileId?: string; label: string }

interface Bundle {
  slug: string
  title: string
  description?: string | null
  price: number
  discount?: number | null
  items: { postId?: string | null; fileId?: string | null; post?: { id: string; title: string; type: string } | null; file?: { id: string; name: string } | null }[]
}

interface Props {
  initial: Bundle | null
  onSave: () => void
  onCancel: () => void
}

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID').format(n) }

export default function BundleForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : '')
  const [discount, setDiscount] = useState(initial?.discount ? String(initial.discount) : '')
  const [items, setItems] = useState<SelectedItem[]>(
    initial?.items.map(i => ({
      postId: i.postId ?? undefined,
      fileId: i.fileId ?? undefined,
      label: i.post ? (i.post.type === 'html' ? '🔗 ' : '📄 ') + i.post.title : i.file ? '🔗 ' + i.file.name : '',
    })) ?? []
  )
  const [posts, setPosts] = useState<PostOption[]>([])
  const [appFiles, setAppFiles] = useState<FileOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load creator's published posts
    fetch('/api/dashboard/posts?all=1').then(r => r.json()).then(d => setPosts(d.posts ?? d ?? []))
    // Load creator's app link files
    fetch('/api/dashboard/files?type=url').then(r => r.json()).then(d => setAppFiles(d ?? []))
  }, [])

  const addPost = (post: PostOption) => {
    if (items.find(i => i.postId === post.id)) return
    setItems(prev => [...prev, { postId: post.id, label: (post.type === 'html' ? '🔗 ' : '📄 ') + post.title }])
  }

  const addFile = (file: FileOption) => {
    if (items.find(i => i.fileId === file.id)) return
    setItems(prev => [...prev, { fileId: file.id, label: '🔗 ' + file.name }])
  }

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!title.trim()) { setError('Judul bundle wajib diisi'); return }
    if (!price || isNaN(parseInt(price))) { setError('Harga wajib diisi'); return }
    if (items.length < 2) { setError('Bundle minimal 2 item'); return }
    setError(''); setSaving(true)

    const body = { title, description, price, discount: discount || null, items: items.map(i => ({ postId: i.postId, fileId: i.fileId })) }
    const res = initial
      ? await fetch(`/api/bundles/${initial.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/bundles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    setSaving(false)
    if (res.ok) onSave()
    else { const d = await res.json(); setError(d.error ?? 'Gagal menyimpan') }
  }

  const inputStyle = { width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' as const }
  const effectivePrice = price && discount ? Math.round(parseInt(price) * (1 - parseInt(discount) / 100)) : parseInt(price)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1.25rem' }}>
        {initial ? 'Edit Bundle' : 'Buat Bundle Baru'}
      </h2>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Judul Bundle *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Contoh: Paket Lengkap Belajar Web Dev" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Deskripsi</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Apa saja yang didapat pembeli?" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Harga Bundle (IDR) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem' }}>Rp</span>
              <input value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, paddingLeft: '2.5rem' }} placeholder="50000" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Diskon %</label>
            <input type="number" min={0} max={99} value={discount} onChange={e => setDiscount(e.target.value)} style={inputStyle} placeholder="0" />
          </div>
        </div>
        {price && discount && parseInt(discount) > 0 && (
          <p style={{ fontSize: '0.8125rem', color: '#059669' }}>
            Harga setelah diskon: <strong>Rp {formatIDR(effectivePrice)}</strong> (hemat {discount}%)
          </p>
        )}
      </div>

      {/* Item selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.625rem' }}>Isi Bundle (min. 2 item)</label>

        {/* Selected items */}
        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f7f5f2', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#1a1a1a' }}>{item.label}</span>
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem', padding: '0 0.25rem' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Add from posts */}
        {posts.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '0.375rem' }}>Tambah artikel:</div>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {posts.filter(p => !items.find(i => i.postId === p.id)).map(p => (
                <button key={p.id} onClick={() => addPost(p)}
                  style={{ fontSize: '0.8125rem', background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', color: '#1a1a1a' }}>
                  + {p.type === 'html' ? '🔗 ' : '📄 '}{p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add from app files */}
        {appFiles.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '0.375rem' }}>Tambah app link:</div>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {appFiles.filter(f => !items.find(i => i.fileId === f.id)).map(f => (
                <button key={f.id} onClick={() => addFile(f)}
                  style={{ fontSize: '0.8125rem', background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', color: '#1a1a1a' }}>
                  + 🔗 {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onCancel} style={{ background: '#f7f5f2', border: '1px solid #e5e0d8', color: '#6e6a65', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
          Batal
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Buat Bundle'}
        </button>
      </div>
    </div>
  )
}
