'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  title: string
  price: number
  authorName: string
  refCode?: string
  onSuccess: () => void
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function BuyModal({ slug, title, price, authorName, refCode, onSuccess }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; final: number } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [buying, setBuying] = useState(false)
  const [success, setSuccess] = useState(false)

  const finalPrice = discountInfo?.final ?? price

  const checkDiscount = async () => {
    if (!discountCode.trim()) return
    setCheckingDiscount(true)
    setDiscountError('')
    setDiscountInfo(null)
    const res = await fetch(`/api/posts/${slug}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountCode: discountCode.trim(), dryRun: true }),
    })
    // Quick client-side discount calculation preview
    // We'll validate on actual purchase
    setCheckingDiscount(false)
    if (!res.ok) {
      const d = await res.json()
      setDiscountError(d.error ?? 'Kode tidak valid')
      return
    }
    // Rough client preview - actual server will compute
    const code = discountCode.trim().toUpperCase()
    setDiscountInfo({ value: 0, type: 'percent', final: price }) // placeholder
  }

  const buy = async () => {
    if (!session) { router.push('/login'); return }
    setBuying(true)
    const res = await fetch(`/api/posts/${slug}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discountCode: discountCode.trim() || undefined,
        refCode,
      }),
    })
    const data = await res.json()
    setBuying(false)
    if (!res.ok) {
      setDiscountError(data.error ?? 'Terjadi kesalahan')
      return
    }
    setSuccess(true)
    setTimeout(() => {
      setOpen(false)
      setSuccess(false)
      onSuccess()
    }, 1800)
  }

  return (
    <>
      <button
        onClick={() => { if (!session) { router.push('/login'); return } setOpen(true) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px',
          padding: '0.75rem 1.75rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        <span>Beli Rp {formatIDR(price)}</span>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => !buying && setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', zIndex: 1 }}>

            {success ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>
                  Pembelian Berhasil!
                </div>
                <div style={{ color: '#6e6a65', fontSize: '0.875rem' }}>Kamu sekarang bisa membaca artikel ini sepenuhnya.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>Beli Artikel</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6e6a65' }}>oleh {authorName}</p>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.375rem', cursor: 'pointer', color: '#6e6a65' }}>×</button>
                </div>

                {/* Article title */}
                <div style={{ background: '#f7f5f2', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>{title}</div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#6e6a65', fontSize: '0.875rem' }}>Harga</span>
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1a1a1a' }}>Rp {formatIDR(finalPrice)}</span>
                </div>

                {/* Discount code */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>
                    Kode Diskon (opsional)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); setDiscountInfo(null) }}
                      placeholder="KODE"
                      style={{ flex: 1, background: '#fafaf8', border: `1px solid ${discountError ? '#fca5a5' : '#e5e0d8'}`, borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                    />
                    <button
                      type="button"
                      onClick={checkDiscount}
                      disabled={checkingDiscount || !discountCode.trim()}
                      style={{ background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', color: '#1a1a1a', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
                    >
                      {checkingDiscount ? '...' : 'Pakai'}
                    </button>
                  </div>
                  {discountError && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{discountError}</p>}
                  {discountInfo && <p style={{ color: '#059669', fontSize: '0.8125rem', marginTop: '0.375rem' }}>✓ Diskon berhasil diterapkan</p>}
                </div>

                {refCode && (
                  <p style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '1rem' }}>
                    Direkomendasikan oleh: @{refCode}
                  </p>
                )}

                <button
                  onClick={buy}
                  disabled={buying}
                  style={{
                    width: '100%', background: buying ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2',
                    border: 'none', borderRadius: '8px', padding: '0.875rem',
                    fontSize: '1rem', fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {buying ? 'Memproses...' : `Bayar Rp ${formatIDR(finalPrice)}`}
                </button>

                <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '0.75rem' }}>
                  Demo mode — pembayaran real akan aktif setelah integrasi payment gateway
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
