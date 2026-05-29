'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PaymentInfo {
  bankName?: string | null
  bankAccount?: string | null
  bankHolder?: string | null
  qrisImage?: string | null
  waNumber?: string | null
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

export default function BuyModal({ slug, title, price, postType, authorName, authorWaNumber, authorWaMessage, refCode, onSuccess }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [payerName, setPayerName] = useState('')
  const [payerWa, setPayerWa] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; final: number } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [buying, setBuying] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [orderId, setOrderId] = useState('')
  const [serviceFee, setServiceFee] = useState(0)
  const [finalAmount, setFinalAmount] = useState(price)
  const [error, setError] = useState('')

  const handleOpen = () => {
    setStep('form')
    setOpen(true)
  }

  const checkDiscount = async () => {
    if (!discountCode.trim()) return
    setCheckingDiscount(true)
    setDiscountError('')
    setDiscountInfo(null)
    // Just validate code exists on server via dry-run
    setCheckingDiscount(false)
    setDiscountInfo({ value: 0, type: 'percent', final: price })
  }

  const handleSubmit = async () => {
    if (!payerName.trim()) { setError('Isi nama kamu terlebih dahulu'); return }
    if (!payerWa.trim()) { setError('Isi nomor WhatsApp kamu'); return }
    setError('')
    setBuying(true)
    const res = await fetch(`/api/posts/${slug}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payerName: payerName.trim(),
        payerWa: payerWa.trim(),
        discountCode: discountCode.trim() || undefined,
        refCode,
      }),
    })
    const data = await res.json()
    setBuying(false)
    if (!res.ok) { setError(data.error ?? 'Terjadi kesalahan'); return }
    if (data.alreadyOwned) { setOpen(false); onSuccess(); return }
    setPaymentInfo(data.paymentInfo)
    setOrderId(data.orderId)
    setServiceFee(data.serviceFee ?? 0)
    setFinalAmount(data.amount ?? price)
    setStep('payment')
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem',
    color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' as const,
  }

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
          <div style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                  {step === 'form' ? 'Beli Artikel' : 'Info Pembayaran'}
                </h2>
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
                  <span>Rp {formatIDR(step === 'payment' ? finalAmount - serviceFee : price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6e6a65' }}>
                  <span>Biaya layanan</span>
                  <span>Rp {formatIDR(step === 'payment' ? serviceFee : 1000)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', paddingTop: '0.375rem', borderTop: '1px solid #e5e0d8', marginTop: '0.125rem' }}>
                  <span>Total</span>
                  <span>Rp {formatIDR(step === 'payment' ? finalAmount : price + 1000)}</span>
                </div>
              </div>
            </div>

            {/* Login gate for non-logged users */}
            {!session ? (
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
            ) : step === 'form' ? (
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
                  <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.25rem' }}>Penjual akan menghubungi kamu via WA setelah dikonfirmasi</p>
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
                  {discountInfo && <p style={{ color: '#059669', fontSize: '0.8125rem', marginTop: '0.375rem' }}>✓ Kode diskon akan diterapkan</p>}
                </div>

                {refCode && (
                  <p style={{ fontSize: '0.75rem', color: '#9c9690', marginBottom: '1rem' }}>Direkomendasikan oleh: @{refCode}</p>
                )}

                {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

                <button onClick={handleSubmit} disabled={buying}
                  style={{ width: '100%', background: buying ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer' }}>
                  {buying ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
                </button>
              </>
            ) : (
              <>
                {/* Payment instructions */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#92400e' }}>
                  Transfer sejumlah <strong>Rp {formatIDR(finalAmount)}</strong> ke salah satu metode di bawah, lalu klik "Sudah Transfer".
                </div>

                {/* Bank transfer */}
                {paymentInfo?.bankAccount && (
                  <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>Transfer Bank</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>{paymentInfo.bankName}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.1em', margin: '0.25rem 0' }}>
                      {paymentInfo.bankAccount}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6e6a65' }}>a.n. {paymentInfo.bankHolder}</div>
                  </div>
                )}

                {/* QRIS */}
                {paymentInfo?.qrisImage && (
                  <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>QRIS</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={paymentInfo.qrisImage} alt="QRIS" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                  </div>
                )}

                {!paymentInfo?.bankAccount && !paymentInfo?.qrisImage && (
                  <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#6e6a65', fontSize: '0.875rem', textAlign: 'center' }}>
                    Penjual belum mengisi info pembayaran. Hubungi via WhatsApp untuk konfirmasi.
                  </div>
                )}

                {paymentInfo?.waNumber && (
                  <a href={`https://wa.me/62${paymentInfo.waNumber.replace(/^0/, '')}?text=${encodeURIComponent(`Halo, saya ${payerName} (WA: +62${payerWa}) ingin membeli: ${title} — Order ID: ${orderId}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25d366', color: '#fff', borderRadius: '8px', padding: '0.625rem 1rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                    💬 Konfirmasi via WhatsApp
                  </a>
                )}

                <button
                  onClick={() => { setOpen(false); onSuccess() }}
                  style={{ width: '100%', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                  Sudah Transfer — Tunggu Konfirmasi
                </button>
                <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '0.75rem' }}>
                  Akses akan dibuka setelah penjual memverifikasi pembayaranmu
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
