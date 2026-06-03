'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void
        onPending: (result: unknown) => void
        onError: (result: unknown) => void
        onClose: () => void
      }) => void
    }
  }
}

interface BundleItem {
  label: string
  type: 'article' | 'app'
  description: string | null
  href: string
}

interface Props {
  slug: string
  title: string
  description?: string | null
  price: number
  discount?: number | null
  effectivePrice: number
  authorName: string
  authorUsername: string
  isPurchased: boolean
  items: BundleItem[]
}

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID').format(n) }

export default function BundleCheckout({ slug, title, description, price, discount, effectivePrice, authorName, isPurchased: initialPurchased, items }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState<'info' | 'form'>('info')
  const [payerName, setPayerName] = useState('')
  const [payerWa, setPayerWa] = useState('')
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')
  const [purchased, setPurchased] = useState(initialPurchased)

  const handleBuy = async () => {
    if (!payerName.trim()) { setError('Isi nama kamu terlebih dahulu'); return }
    if (!payerWa.trim()) { setError('Isi nomor WhatsApp kamu'); return }
    setError(''); setBuying(true)

    // Step 1: create pending order
    const orderRes = await fetch(`/api/bundles/${slug}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payerName, payerWa }),
    })
    const orderData = await orderRes.json()
    if (!orderRes.ok && orderRes.status !== 201) {
      setBuying(false)
      setError(orderData.error ?? 'Terjadi kesalahan')
      return
    }
    if (orderData.alreadyOwned) { setPurchased(true); setBuying(false); return }

    // Step 2: get Snap token
    const tokenRes = await fetch('/api/midtrans/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.orderId, orderType: 'bundle' }),
    })
    const tokenData = await tokenRes.json()
    setBuying(false)

    if (!tokenRes.ok || !tokenData.token) {
      setError(tokenData.error ?? 'Gagal membuat sesi pembayaran')
      return
    }

    // Step 3: open Snap popup
    if (!window.snap) {
      setError('Snap.js belum dimuat, coba refresh halaman')
      return
    }

    const finalOrderId = orderData.orderId

    window.snap.pay(tokenData.token, {
      onSuccess: async () => {
        await fetch('/api/midtrans/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: finalOrderId, orderType: 'bundle' }),
        })
        setPurchased(true)
      },
      onPending: () => setPurchased(true),
      onError: () => setError('Pembayaran gagal, silakan coba lagi'),
      onClose: () => { /* user tutup popup */ },
    })
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem',
    color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div className="grid-chart-sidebar" style={{ gap: '2rem' }}>
      {/* Left: bundle info */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          📦 Bundle
        </div>
        <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 2rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, marginBottom: '0.75rem' }}>{title}</h1>
        {description && <p style={{ color: '#6e6a65', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{description}</p>}
        <p style={{ fontSize: '0.875rem', color: '#9c9690', marginBottom: '1.5rem' }}>oleh <strong style={{ color: '#1a1a1a' }}>{authorName}</strong></p>

        {/* Items list */}
        <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6e6a65', marginBottom: '0.875rem' }}>Yang kamu dapatkan ({items.length} item):</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.125rem', marginTop: '0.05rem' }}>{item.type === 'app' ? '🔗' : '📄'}</span>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: purchased ? '#0070f3' : '#1a1a1a' }}>
                    {purchased ? <a href={item.href} style={{ color: '#0070f3', textDecoration: 'none' }}>{item.label} →</a> : item.label}
                  </div>
                  {item.description && <div style={{ fontSize: '0.8125rem', color: '#9c9690', marginTop: '0.15rem' }}>{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: checkout card */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '16px', padding: '1.5rem', position: 'sticky', top: '5rem' }}>
        {purchased ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
            <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>Sudah dibeli!</div>
            <div style={{ fontSize: '0.875rem', color: '#6e6a65' }}>Klik item di kiri untuk mengakses</div>
          </div>
        ) : (
          <>
            {/* Price */}
            <div style={{ marginBottom: '1.25rem' }}>
              {discount && discount > 0 ? (
                <>
                  <div style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: '#9c9690' }}>Rp {formatIDR(price)}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(effectivePrice)}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#059669' }}>Hemat {discount}% · {items.length} item</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(price)}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>{items.length} item</div>
                </>
              )}
            </div>

            {step === 'info' && (
              <button onClick={() => {
                if (!session) { router.push(`/login?from=${encodeURIComponent('/bundle/' + slug)}`); return }
                setStep('form')
              }}
                style={{ width: '100%', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Beli Bundle
              </button>
            )}

            {step === 'form' && (
              <div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Nama Lengkap *</label>
                  <input value={payerName} onChange={e => setPayerName(e.target.value)} placeholder="Nama kamu" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Nomor WhatsApp *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem', pointerEvents: 'none' }}>+62</span>
                    <input value={payerWa} onChange={e => setPayerWa(e.target.value.replace(/\D/g, ''))} placeholder="81234567890" style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace' }} />
                  </div>
                </div>
                {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setStep('info')} style={{ flex: 1, background: '#f7f5f2', border: '1px solid #e5e0d8', color: '#6e6a65', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem', cursor: 'pointer' }}>Kembali</button>
                  <button onClick={handleBuy} disabled={buying} style={{ flex: 2, background: buying ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer' }}>
                    {buying ? 'Memproses...' : `Bayar Rp ${formatIDR(effectivePrice)} →`}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '0.625rem' }}>
                  Pembayaran aman via Midtrans
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
