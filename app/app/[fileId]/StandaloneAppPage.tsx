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
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')
  const [alreadyOwned, setAlreadyOwned] = useState(false)

  const effectivePrice = price && discount ? Math.round(price * (1 - discount / 100)) : price

  // Check if already purchased
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
    setBuying(true)
    setError('')
    const res = await fetch(`/api/posts/${slug}/files/${fileId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setBuying(false)
    if (res.ok) {
      window.location.href = url
    } else {
      const d = await res.json()
      setError(d.error ?? 'Terjadi kesalahan')
    }
  }

  const isFree = !price

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f5f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* App card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e0d8',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          textAlign: 'center',
        }}>
          {/* App icon placeholder */}
          <div style={{
            width: '80px', height: '80px',
            background: '#1a1a1a',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
          }}>
            🔗
          </div>

          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem', lineHeight: 1.3 }}>
            {name}
          </h1>

          {/* Intro / description */}
          {intro && (
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.9375rem', color: '#6e6a65', lineHeight: 1.7,
                textAlign: 'left', maxHeight: '4.8em', overflow: 'hidden',
              }}>
                {intro}
              </p>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5em',
                background: 'linear-gradient(to bottom, transparent, #ffffff)',
              }} />
            </div>
          )}

          {/* Price */}
          {effectivePrice ? (
            <div style={{ marginBottom: '2rem' }}>
              {discount && discount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ textDecoration: 'line-through', color: '#9c9690', fontSize: '1rem' }}>
                    Rp {formatIDR(price!)}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>
                    Rp {formatIDR(effectivePrice)}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>
                  Rp {formatIDR(effectivePrice)}
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', marginBottom: '2rem' }}>
              Gratis
            </div>
          )}

          {/* CTA */}
          {alreadyOwned ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', width: '100%',
                background: '#059669', color: '#ffffff',
                border: 'none', borderRadius: '10px',
                padding: '0.875rem',
                fontSize: '1rem', fontWeight: 600,
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              Buka App →
            </a>
          ) : (
            <button
              onClick={isFree ? () => { window.location.href = url } : handleBuy}
              disabled={buying}
              style={{
                width: '100%',
                background: buying ? '#6e6a65' : '#1a1a1a',
                color: '#f7f5f2',
                border: 'none', borderRadius: '10px',
                padding: '0.875rem',
                fontSize: '1rem', fontWeight: 600,
                cursor: buying ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {buying ? 'Memproses...' : isFree ? 'Buka App' : `Beli & Buka — Rp ${formatIDR(effectivePrice!)}`}
            </button>
          )}

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</p>
          )}

          {!isFree && (
            <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.75rem' }}>
              Demo mode — pembayaran real aktif setelah integrasi payment gateway
            </p>
          )}
        </div>

        {/* Powered by */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#9c9690' }}>
          Dijual melalui <a href="/" style={{ color: '#6e6a65', textDecoration: 'none', fontWeight: 500 }}>XALES</a>
        </p>
      </div>
    </div>
  )
}
