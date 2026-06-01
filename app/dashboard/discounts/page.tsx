'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface Discount {
  id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  usedCount: number
  maxUses: number | null
  expiresAt: string | null
  active: boolean
  post: { title: string; slug: string } | null
  createdAt: string
}

interface PremiumPost {
  id: string
  slug: string
  title: string
  price: number
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function DiscountsPage() {
  const searchParams = useSearchParams()
  const preselectedSlug = searchParams.get('post') ?? ''

  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [premiumPosts, setPremiumPosts] = useState<PremiumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: '', postId: '', maxUses: '', expiresAt: '' })
  const [msg, setMsg] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchDiscounts = async () => {
    const res = await fetch('/api/discount')
    const data = await res.json()
    setDiscounts(data.discounts ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDiscounts()
    fetch('/api/dashboard/posts')
      .then(r => r.json())
      .then(data => {
        const premium = (data.posts ?? []).filter((p: any) => p.isPremium && p.price)
        setPremiumPosts(premium)
        if (preselectedSlug) {
          const match = premium.find((p: PremiumPost) => p.slug === preselectedSlug)
          if (match) {
            setForm(f => ({ ...f, postId: match.id }))
            setShowForm(true)
          }
        }
      })
  }, [preselectedSlug])

  const create = async () => {
    if (!form.code || !form.value) { setMsg('Kode dan nilai wajib diisi'); return }
    setCreating(true)
    setMsg('')
    const res = await fetch('/api/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseInt(form.value),
        postId: form.postId || null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setMsg(data.error); return }
    setMsg('✓ Kode diskon dibuat!')
    setForm({ code: '', type: 'percent', value: '', postId: '', maxUses: '', expiresAt: '' })
    setShowForm(false)
    fetchDiscounts()
  }

  const deactivate = async (id: string) => {
    await fetch('/api/discount', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchDiscounts()
  }

  const inputStyle = { width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', color: '#1a1a1a', fontSize: '0.9375rem', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.3rem' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Kode Diskon</h1>
          <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>Buat kode diskon untuk konten premiummu</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
          + Buat Kode
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1.25rem' }}>Kode Diskon Baru</h2>

          {/* Post selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Berlaku untuk</label>
            <select
              value={form.postId}
              onChange={e => setForm({ ...form, postId: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Semua konten premium saya</option>
              {premiumPosts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} — Rp {formatIDR(p.price)}
                </option>
              ))}
            </select>
            {premiumPosts.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.25rem' }}>
                Belum ada konten premium — voucher berlaku untuk semua konten.
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Kode *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }} placeholder="HEMAT20" />
            </div>
            <div>
              <label style={labelStyle}>Tipe Diskon *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['percent', 'fixed'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    style={{ flex: 1, padding: '0.625rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${form.type === t ? '#1a1a1a' : '#e5e0d8'}`, background: form.type === t ? '#1a1a1a' : '#ffffff', color: form.type === t ? '#f7f5f2' : '#6e6a65' }}>
                    {t === 'percent' ? '% Persen' : 'Rp Nominal'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>{form.type === 'percent' ? 'Persen (1-100) *' : 'Nominal IDR *'}</label>
              <div style={{ position: 'relative' }}>
                {form.type === 'fixed' && <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem' }}>Rp</span>}
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: form.type === 'fixed' ? '2.5rem' : undefined }} placeholder={form.type === 'percent' ? '20' : '10000'} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Maks. Pemakaian</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} style={inputStyle} placeholder="Kosong = tak terbatas" />
            </div>
            <div>
              <label style={labelStyle}>Berlaku Sampai</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
            </div>
          </div>
          {msg && <p style={{ color: msg.includes('✓') ? '#059669' : '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={create} disabled={creating} style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer' }}>
              {creating ? '...' : 'Buat Kode'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', color: '#6e6a65', cursor: 'pointer' }}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>Loading...</div>
        ) : discounts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>
            <p>Belum ada kode diskon.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Buat kode untuk promosikan konten premiummu.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #e5e0d8', fontSize: '0.75rem', color: '#9c9690', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Kode</span><span>Diskon</span><span>Pemakaian</span><span>Berlaku</span><span>Status</span><span>Aksi</span>
            </div>
            {discounts.map((d, i) => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < discounts.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.08em' }}>{d.code}</span>
                  <div style={{ fontSize: '0.7rem', color: '#9c9690', marginTop: '0.125rem' }}>
                    {d.post ? d.post.title : 'Semua konten'}
                  </div>
                </div>
                <span style={{ color: '#1a1a1a', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {d.type === 'percent' ? `${d.value}%` : `Rp ${formatIDR(d.value)}`}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#6e6a65', whiteSpace: 'nowrap' }}>
                  {d.usedCount}{d.maxUses ? `/${d.maxUses}` : ''}×
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#9c9690', whiteSpace: 'nowrap' }}>
                  {d.expiresAt ? formatDate(d.expiresAt) : '∞'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: d.active ? '#059669' : '#9c9690', whiteSpace: 'nowrap' }}>
                  {d.active ? '● Aktif' : '○ Nonaktif'}
                </span>
                {d.active && (
                  <button onClick={() => deactivate(d.id)} style={{ fontSize: '0.8125rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Nonaktifkan
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
