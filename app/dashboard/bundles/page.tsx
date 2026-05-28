'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BundleForm from './BundleForm'

interface BundleItem {
  id: string
  postId?: string | null
  fileId?: string | null
  post?: { id: string; title: string; slug: string; type: string } | null
  file?: { id: string; name: string; mimeType: string } | null
}

interface Bundle {
  id: string
  slug: string
  title: string
  description?: string | null
  price: number
  discount?: number | null
  published: boolean
  createdAt: string
  items: BundleItem[]
  _count: { purchases: number }
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBundle, setEditBundle] = useState<Bundle | null>(null)

  const fetch_ = async () => {
    const res = await fetch('/api/bundles')
    setBundles(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const togglePublish = async (bundle: Bundle) => {
    await fetch(`/api/bundles/${bundle.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !bundle.published }),
    })
    fetch_()
  }

  const deleteBundle = async (bundle: Bundle) => {
    if (!confirm(`Hapus bundle "${bundle.title}"?`)) return
    await fetch(`/api/bundles/${bundle.slug}`, { method: 'DELETE' })
    fetch_()
  }

  if (loading) return <div style={{ color: '#6e6a65', padding: '4rem', textAlign: 'center' }}>Memuat...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Bundle</h1>
          <p style={{ color: '#6e6a65', fontSize: '0.875rem', marginTop: '0.25rem' }}>Jual beberapa artikel & app sebagai satu paket</p>
        </div>
        <button onClick={() => { setEditBundle(null); setShowForm(true) }}
          style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer' }}>
          + Buat Bundle
        </button>
      </div>

      {showForm && (
        <BundleForm
          initial={editBundle}
          onSave={() => { setShowForm(false); setEditBundle(null); fetch_() }}
          onCancel={() => { setShowForm(false); setEditBundle(null) }}
        />
      )}

      {bundles.length === 0 && !showForm ? (
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '4rem 2rem', textAlign: 'center', color: '#6e6a65' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
          <p style={{ fontWeight: 500, color: '#1a1a1a' }}>Belum ada bundle</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Gabungkan beberapa konten menjadi satu paket dengan harga spesial</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bundles.map(bundle => {
            const effectivePrice = bundle.discount ? Math.round(bundle.price * (1 - bundle.discount / 100)) : bundle.price
            return (
              <div key={bundle.id} style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{bundle.title}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', background: bundle.published ? '#ecfdf5' : '#f7f5f2', color: bundle.published ? '#059669' : '#9c9690' }}>
                        {bundle.published ? 'Publik' : 'Draft'}
                      </span>
                    </div>
                    {bundle.description && <p style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.5rem' }}>{bundle.description}</p>}
                    <div style={{ fontSize: '0.8125rem', color: '#6e6a65', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {bundle.discount ? <><span style={{ textDecoration: 'line-through', color: '#9c9690', fontWeight: 400 }}>Rp {formatIDR(bundle.price)}</span> Rp {formatIDR(effectivePrice)}</> : `Rp ${formatIDR(bundle.price)}`}
                      </span>
                      <span>·</span>
                      <span>{bundle.items.length} item</span>
                      <span>·</span>
                      <span>{bundle._count.purchases} pembelian</span>
                    </div>
                    {/* Items preview */}
                    <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {bundle.items.map(item => (
                        <span key={item.id} style={{ fontSize: '0.75rem', background: '#f0ede8', color: '#6e6a65', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          {item.post ? (item.post.type === 'html' ? '🔗 ' : '📄 ') + item.post.title : item.file ? '🔗 ' + item.file.name : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    {bundle.published && (
                      <Link href={`/bundle/${bundle.slug}`} target="_blank"
                        style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.375rem 0.75rem', background: '#f7f5f2', whiteSpace: 'nowrap' }}>
                        ↗ Lihat
                      </Link>
                    )}
                    <button onClick={() => { setEditBundle(bundle); setShowForm(true) }}
                      style={{ fontSize: '0.8125rem', color: '#1a1a1a', background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.375rem 0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Edit
                    </button>
                    <button onClick={() => togglePublish(bundle)}
                      style={{ fontSize: '0.8125rem', color: bundle.published ? '#dc2626' : '#059669', background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.375rem 0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {bundle.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => deleteBundle(bundle)}
                      style={{ fontSize: '0.8125rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem' }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
