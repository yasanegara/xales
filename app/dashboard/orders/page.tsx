'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  orderId: string
  amount: number
  status: string
  payerName: string | null
  payerWa: string | null
  createdAt: string
  user: { username: string; name: string | null; email: string }
  post?: { title: string; slug: string }
  file?: { name: string; mimeType: string; post: { title: string; slug: string } }
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrdersPage() {
  const [articleOrders, setArticleOrders] = useState<Order[]>([])
  const [fileOrders, setFileOrders] = useState<Order[]>([])
  const [bundleOrders, setBundleOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'pending' | 'paid'>('pending')
  const [activating, setActivating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setArticleOrders(data.articleOrders ?? [])
    setFileOrders(data.fileOrders ?? [])
    setBundleOrders(data.bundleOrders ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const activate = async (orderId: string, type: 'article' | 'file' | 'bundle') => {
    setActivating(orderId)
    const res = await fetch('/api/orders/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, type }),
    })
    setActivating(null)
    if (res.ok) fetchOrders()
  }

  const allOrders: (Order & { type: 'article' | 'file' | 'bundle' })[] = [
    ...articleOrders.map(o => ({ ...o, type: 'article' as const })),
    ...fileOrders.map(o => ({ ...o, type: 'file' as const })),
    ...bundleOrders.map(o => ({ ...o, type: 'bundle' as const, post: (o as any).bundle })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filtered = allOrders.filter(o => o.status === tab)
  const pendingCount = allOrders.filter(o => o.status === 'pending').length

  if (loading) return <div style={{ color: '#6e6a65', padding: '4rem', textAlign: 'center' }}>Memuat...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Pesanan</h1>
        {pendingCount > 0 && (
          <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
            {pendingCount} menunggu
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e0d8' }}>
        {(['pending', 'paid'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.9375rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? '#1a1a1a' : '#6e6a65',
              borderBottom: tab === t ? '2px solid #1a1a1a' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t === 'pending' ? `Menunggu (${allOrders.filter(o => o.status === 'pending').length})` : `Selesai (${allOrders.filter(o => o.status === 'paid').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '4rem 2rem', textAlign: 'center', color: '#6e6a65' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tab === 'pending' ? '📭' : '✓'}</div>
          <p style={{ fontWeight: 500, color: '#1a1a1a' }}>
            {tab === 'pending' ? 'Tidak ada pesanan yang menunggu' : 'Belum ada pesanan selesai'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(order => (
            <div key={order.orderId} style={{ background: '#ffffff', border: `1px solid ${order.status === 'pending' ? '#fde68a' : '#e5e0d8'}`, borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Item title */}
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                    {order.type === 'article' ? order.post?.title : order.type === 'bundle' ? `Bundle: ${order.post?.title}` : `${order.file?.name}`}
                  </div>
                  {order.type === 'file' && (
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '0.25rem' }}>
                      dari artikel: {order.file?.post.title}
                    </div>
                  )}

                  {/* Payer info */}
                  <div style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.375rem' }}>
                    {order.payerName ? (
                      <span>{order.payerName}</span>
                    ) : (
                      <span>{order.user.name ?? `@${order.user.username}`}</span>
                    )}
                    {order.payerWa && (
                      <a
                        href={`https://wa.me/62${order.payerWa.replace(/^0/, '')}?text=${encodeURIComponent(`Halo ${order.payerName ?? order.user.name ?? ''}, pembayaranmu sudah dikonfirmasi! Silakan akses konten yang sudah kamu beli.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ marginLeft: '0.5rem', color: '#25d366', fontWeight: 500, textDecoration: 'none', fontSize: '0.8125rem' }}
                      >
                        💬 WA
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#9c9690', flexWrap: 'wrap' }}>
                    <span>Rp {formatIDR(order.amount)}</span>
                    <span>·</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>·</span>
                    <span style={{ fontFamily: 'monospace' }}>{order.orderId.slice(0, 16)}...</span>
                  </div>
                </div>

                {/* Action */}
                {order.status === 'pending' ? (
                  <button
                    onClick={() => activate(order.orderId, order.type as 'article' | 'file' | 'bundle')}
                    disabled={activating === order.orderId}
                    style={{
                      flexShrink: 0, background: activating === order.orderId ? '#6e6a65' : '#059669',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '0.5rem 1.125rem', fontSize: '0.875rem', fontWeight: 600,
                      cursor: activating === order.orderId ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {activating === order.orderId ? 'Memproses...' : '✓ Aktifkan'}
                  </button>
                ) : (
                  <span style={{ flexShrink: 0, fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>✓ Aktif</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
