'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Props {
  fileId: string
  slug: string
  name: string
  intro: string
  price: number | null
  discount: number | null
  url: string
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function StandaloneAppPage({ fileId, slug, name, intro, price, discount, url }: Props) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<'info' | 'form' | 'payment'>('info')
  const [payerName, setPayerName] = useState('')
  const [payerWa, setPayerWa] = useState('')
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    bankName?: string | null
    bankAccount?: string | null
    bankHolder?: string | null
    qrisImage?: string | null
    waNumber?: string | null
  } | null>(null)
  const [finalAmount, setFinalAmount] = useState(price ?? 0)
  const [orderId, setOrderId] = useState('')

  const effectivePrice = price && discount ? Math.round(price * (1 - discount / 100)) : price
  const isFree = !price

  useEffect(() => {
    if (!session || !price) return
    fetch(`/api/app/${fileId}/check`)
      .then(r => r.json())
      .then(d => { if (d.owned) setAlreadyOwned(true) })
      .catch(() => {})
  }, [session, fileId, price])

  const handleBuy = async () => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/login?from=${encodeURIComponent(`/app/${fileId}`)}`)
      return
    }
    if (!payerName.trim()) { setError('Isi nama kamu terlebih dahulu'); return }
    if (!payerWa.trim()) { setError('Isi nomor WhatsApp kamu'); return }
    setError('')
    setBuying(true)
    const res = await fetch(`/api/posts/${slug}/files/${fileId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payerName: payerName.trim(), payerWa: payerWa.trim() }),
    })
    setBuying(false)
    const data = await res.json()
    if (!res.ok && res.status !== 201) { setError(data.error ?? 'Terjadi kesalahan'); return }
    if (data.alreadyOwned) { window.location.href = url; return }
    setPaymentInfo(data.paymentInfo)
    setOrderId(data.orderId)
    setFinalAmount(data.amount ?? effectivePrice ?? 0)
    setStep('payment')
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem',
    color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
          {/* App icon */}
          <div style={{ width: '56px', height: '56px', background: '#1a1a1a', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            🔗
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem', lineHeight: 1.3 }}>
            {name}
          </h1>

          {intro && (
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.9375rem', color: '#6e6a65', lineHeight: 1.7, maxHeight: '5em', overflow: 'hidden', margin: 0 }}>
                {intro}
              </p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5em', background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
            </div>
          )}

          {/* Price display */}
          {effectivePrice ? (
            <div style={{ marginBottom: '1.5rem' }}>
              {discount && discount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9c9690', fontSize: '0.9375rem' }}>Rp {formatIDR(price!)}</span>
                  <span style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(effectivePrice)}</span>
                </div>
              ) : (
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(effectivePrice)}</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#059669', marginBottom: '1.5rem' }}>Gratis</div>
          )}

          {/* Step: info */}
          {step === 'info' && (
            alreadyOwned ? (
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', background: '#059669', color: '#fff', borderRadius: '10px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                Buka App →
              </a>
            ) : isFree ? (
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', background: '#1a1a1a', color: '#f7f5f2', borderRadius: '10px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                Buka App
              </a>
            ) : (
              <button onClick={() => {
                if (!session) { router.push(`/login?from=${encodeURIComponent('/app/' + fileId)}`) ; return }
                setStep('form')
              }}
                style={{ width: '100%', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Beli — Rp {formatIDR(effectivePrice!)}
              </button>
            )
          )}

          {/* Step: form (payer info) */}
          {step === 'form' && (
            <div>
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
              {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setStep('info')}
                  style={{ flex: 1, background: '#f7f5f2', border: '1px solid #e5e0d8', color: '#6e6a65', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
                  Kembali
                </button>
                <button onClick={handleBuy} disabled={buying}
                  style={{ flex: 2, background: buying ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer' }}>
                  {buying ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
                </button>
              </div>
            </div>
          )}

          {/* Step: payment info */}
          {step === 'payment' && (
            <div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#92400e' }}>
                Transfer <strong>Rp {formatIDR(finalAmount)}</strong> ke salah satu metode di bawah, lalu konfirmasi.
              </div>

              {paymentInfo?.bankAccount && (
                <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Transfer Bank</div>
                  <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{paymentInfo.bankName}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.08em', margin: '0.2rem 0' }}>{paymentInfo.bankAccount}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6e6a65' }}>a.n. {paymentInfo.bankHolder}</div>
                </div>
              )}

              {paymentInfo?.qrisImage && (
                <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>QRIS</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={paymentInfo.qrisImage} alt="QRIS" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                </div>
              )}

              {paymentInfo?.waNumber && (
                <a href={`https://wa.me/62${paymentInfo.waNumber.replace(/^0/, '')}?text=${encodeURIComponent(`Halo, saya ${payerName} (WA: +62${payerWa}) ingin membeli app: ${name} — Order ID: ${orderId}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25d366', color: '#fff', borderRadius: '8px', padding: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  💬 Konfirmasi via WhatsApp
                </a>
              )}

              <p style={{ fontSize: '0.8125rem', color: '#6e6a65', textAlign: 'center', lineHeight: 1.5 }}>
                Akses dibuka setelah penjual memverifikasi pembayaranmu
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#9c9690' }}>
          Dijual melalui <a href="/" style={{ color: '#6e6a65', textDecoration: 'none', fontWeight: 500 }}>XALES</a>
        </p>
      </div>
    </div>
  )
}
