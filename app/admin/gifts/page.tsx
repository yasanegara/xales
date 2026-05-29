'use client'

import { useState, useEffect } from 'react'

interface GiftItem {
  id: string; emoji: string; name: string; price: number; isActive: boolean; order: number
  _count: { sentGifts: number }
}

function fmt(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }

export default function AdminGiftsPage() {
  const [gifts, setGifts]   = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]     = useState({ emoji: '', name: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/gifts').then(r => r.json()).then(d => { setGifts(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.emoji || !form.name || !form.price) { setError('Semua field wajib diisi'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/admin/gifts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { setError('Gagal menyimpan'); return }
    setForm({ emoji: '', name: '', price: '' }); load()
  }

  const toggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/gifts/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Hapus hadiah ini?')) return
    await fetch(`/api/admin/gifts/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Katalog Hadiah</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.9rem' }}>Kelola hadiah yang bisa dikirim pembaca ke kreator</p>
      </div>

      {/* Add form */}
      <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>Tambah Hadiah Baru</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 140px', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Emoji</label>
            <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🌟"
              style={{ width: '100%', textAlign: 'center', fontSize: '1.25rem', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.5rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Nama</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bintang Emas"
              style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Harga (IDR)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="5000"
              style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{error}</p>}
        <button onClick={add} disabled={saving}
          style={{ marginTop: '0.875rem', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Menyimpan...' : '+ Tambah'}
        </button>
      </div>

      {/* Gift list */}
      {gifts.length === 0 ? (
        <p style={{ color: '#9c9690', textAlign: 'center', padding: '2rem' }}>Belum ada hadiah. Tambahkan di atas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {gifts.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', border: `1px solid ${g.isActive ? '#e5e0d8' : '#f0ede8'}`, borderRadius: '10px', padding: '0.875rem 1.125rem', opacity: g.isActive ? 1 : 0.55 }}>
              <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{g.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{g.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{fmt(g.price)} · {g._count.sentGifts} dikirim</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: g.isActive ? '#ecfdf5' : '#f5f5f5', color: g.isActive ? '#059669' : '#9c9690', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>
                {g.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
              <button onClick={() => toggle(g.id, g.isActive)}
                style={{ background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', color: '#6e6a65' }}>
                {g.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => del(g.id)}
                style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', color: '#dc2626' }}>
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
