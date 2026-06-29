'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

interface Props {
  slug: string
  title: string
  price: number
  postType: string
  authorName: string
  authorWaNumber?: string | null
  authorWaMessage?: string | null
  refCode?: string
  onSuccess: () => void
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function BuyModal({ slug, title, price, postType, authorName, refCode, onSuccess }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [payerName, setPayerName] = useState('')
  const [payerWa, setPayerWa] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; final: number; savings: number } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [buying, setBuying] = useState(false)
  const [serviceFee, setServiceFee] = useState(0)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleOpen = async () => {
    setOpen(true)
    try {
      const res = await fetch(`/api/fee?type=${encodeURIComponent(postType)}`)
      const data = await res.json()
      if (typeof data.serviceFee === 'number') setServiceFee(data.serviceFee)
    } catch { /* keep 0 as fallback */ }
  }

  const checkDiscount = async () => {
    if (!discountCode.trim()) return
    setCheckingDiscount(true)
    setDiscountError('')
    setDiscountInfo(null)
    const res = await fetch(`/api/discount/validate?code=${encodeURIComponent(discountCode.trim())}&slug=${encodeURIComponent(slug)}`)
    const data = await res.json()
    setCheckingDiscount(false)
    if (!data.valid) { setDiscountError(data.error ?? 'Kode tidak valid'); return }
    setDiscountInfo({ value: data.value, type: data.type, final: data.finalPrice, savings: data.savings })
  }

  const handleSubmit = async () => {
    if (!payerName.trim()) { setError('Isi nama kamu terlebih dahulu'); return }
    if (!payerWa.trim()) { setError('Isi nomor WhatsApp kamu'); return }
    setError('')
    setBuying(true)

    // Step 1: create pending order
    const orderRes = await fetch(`/api/posts/${slug}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payerName: payerName.trim(),
        payerWa: payerWa.trim(),
        discountCode: discountCode.trim() || undefined,
        refCode,
      }),
    })
    const orderData = await orderRes.json()
    if (!orderRes.ok) { setBuying(false); setError(orderData.error ?? 'Terjadi kesalahan'); return }
    if (orderData.alreadyOwned) { setOpen(false); onSuccess(); return }

    // Step 2: get Snap token
    const tokenRes = await fetch('/api/midtrans/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.orderId, orderType: 'article' }),
    })
    const tokenData = await tokenRes.json()
    setBuying(false)

    if (!tokenRes.ok || !tokenData.token) {
      setError((tokenData.error ?? 'Gagal membuat sesi pembayaran') + (tokenData.detail ? `: ${tokenData.detail}` : ''))
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
        // Verify & update status langsung (fallback jika webhook belum tiba)
        await fetch('/api/midtrans/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: finalOrderId, orderType: 'article' }),
        })
        setOpen(false)
        onSuccess()
      },
      onPending: () => { setBuying(false); setPending(true) },
      onError: () => setError('Pembayaran gagal, silakan coba lagi'),
      onClose: () => { /* user tutup popup */ },
    })
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem',
    color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' as const,
  }

  const totalDisplay = discountInfo ? discountInfo.final + serviceFee : price + serviceFee

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px',
          padding: '0.75rem 1.75rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        Beli — Rp {formatIDR(price)}
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => !buying && setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="modal-box">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>Beli Artikel</h2>
                <p style={{ fontSize: '0.875rem', color: '#6e6a65' }}>oleh {authorName}</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.375rem', cursor: 'pointer', color: '#6e6a65' }}>×</button>
            </div>

            {/* Price breakdown */}
            <div style={{ background: '#f7f5f2', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, marginBottom: '0.75rem' }}>{title}</div>
              <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6e6a65' }}>
                  <span>Harga {postType === 'html' ? 'App' : 'Artikel'}</span>
                  <span>Rp {formatIDR(price)}</span>
                </div>
                {discountInfo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#059669' }}>
                    <span>Diskon ({discountInfo.type === 'percent' ? `${discountInfo.value}%` : `Rp ${formatIDR(discountInfo.value)}`})</span>
                    <span>− Rp {formatIDR(discountInfo.savings)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6e6a65' }}>
                  <span>Biaya layanan</span>
                  <span>Rp {formatIDR(serviceFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', paddingTop: '0.375rem', borderTop: '1px solid #e5e0d8', marginTop: '0.125rem' }}>
                  <span>Total</span>
                  <span>Rp {formatIDR(totalDisplay)}</span>
                </div>
              </div>
            </div>

            {/* Pending state */}
            {pending ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
                <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Menunggu pembayaran</div>
                <p style={{ fontSize: '0.875rem', color: '#6e6a65', lineHeight: 1.6 }}>
                  Selesaikan pembayaran sesuai instruksi, lalu refresh halaman ini untuk mengakses konten.
                </p>
                <button onClick={() => setOpen(false)} style={{ marginTop: '1rem', background: '#f0ede8', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', color: '#1a1a1a' }}>
                  Tutup
                </button>
              </div>
            ) : !session ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔐</div>
                <p style={{ fontSize: '0.9375rem', color: '#4a4540', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  Masuk dulu untuk melanjutkan pembelian.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <a
                    href={`/login?from=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                    style={{ display: 'block', background: '#1a1a1a', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}
                  >
                    Masuk
                  </a>
                  <a
                    href={`/register?from=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                    style={{ display: 'block', background: '#f7f5f2', color: '#1a1a1a', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem', border: '1px solid #e5e0d8' }}
                  >
                    Daftar gratis
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Payer info */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>
                    Nama Lengkap <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input type="text" value={payerName} onChange={e => setPayerName(e.target.value)}
                    placeholder="Nama kamu" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>
                    Nomor WhatsApp <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem', pointerEvents: 'none' }}>+62</span>
                    <input type="text" value={payerWa} onChange={e => setPayerWa(e.target.value.replace(/\D/g, ''))}
                      placeholder="81234567890" style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace' }} />
                  </div>
                </div>

                {/* Discount code */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>
                    Kode Diskon (opsional)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); setDiscountInfo(null) }}
                      placeholder="KODE"
                      style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                    <button type="button" onClick={checkDiscount} disabled={checkingDiscount || !discountCode.trim()}
                      style={{ background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', color: '#1a1a1a', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {checkingDiscount ? '...' : 'Pakai'}
                    </button>
                  </div>
                  {discountError && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{discountError}</p>}
                  {discountInfo && (
                    <p style={{ color: '#059669', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                      ✓ Hemat Rp {formatIDR(discountInfo.savings)} — bayar Rp {formatIDR(discountInfo.final + serviceFee)}
                    </p>
                  )}
                </div>

                {refCode && (
                  <p style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '1rem' }}>Direkomendasikan oleh: @{refCode}</p>
                )}

                {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

                <button onClick={handleSubmit} disabled={buying}
                  style={{ width: '100%', background: buying ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer' }}>
                  {buying ? 'Memproses...' : `Bayar Rp ${formatIDR(totalDisplay)} →`}
                </button>
                <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '0.625rem' }}>
                  Pembayaran diproses aman via Midtrans
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
