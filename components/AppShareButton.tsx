'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Props {
  title: string
  slug: string
  authorUsername: string
  affiliateEnabled?: boolean
  affiliateRate?: number
}

export default function AppShareButton({ title, slug, authorUsername, affiliateEnabled, affiliateRate }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const myUsername    = session?.user?.username
  const isAuthor      = myUsername === authorUsername
  const showAffiliate = !!(affiliateEnabled && affiliateRate && myUsername && !isAuthor)

  const baseUrl  = typeof window !== 'undefined'
    ? `${window.location.origin}/@${authorUsername}/${slug}`
    : `https://xales.id/@${authorUsername}/${slug}`
  const shareUrl = showAffiliate ? `${baseUrl}?ref=${myUsername}` : baseUrl

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: shareUrl }); return } catch { /* cancelled */ }
    }
    await copy()
  }

  if (!showAffiliate) {
    return (
      <button onClick={shareNative} style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px',
        padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 600,
        color: copied ? '#059669' : '#1a1a1a', cursor: 'pointer',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}>
        {copied ? '✓ Tersalin' : '↑ Bagikan'}
      </button>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        background: open ? '#f0fdf4' : 'none',
        border: `1px solid ${open ? '#86efac' : '#e5e0d8'}`,
        borderRadius: '6px', padding: '0.25rem 0.625rem',
        fontSize: '0.75rem', fontWeight: 600,
        color: open ? '#15803d' : '#1a1a1a',
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}>
        💰 Bagikan &amp; Cuan
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#ffffff', border: '1px solid #e5e0d8',
          borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '1rem', width: '280px', zIndex: 100,
        }}>
          {/* Commission info */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #86efac', borderRadius: '8px',
            padding: '0.625rem 0.875rem', marginBottom: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.125rem' }}>💸</span>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d' }}>
                Dapatkan {affiliateRate}% komisi
              </div>
              <div style={{ fontSize: '0.7rem', color: '#166534' }}>
                untuk setiap penjualan via link kamu
              </div>
            </div>
          </div>

          {/* Link preview */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9c9690', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Link afiliasi kamu
            </div>
            <div style={{
              background: '#f7f5f2', borderRadius: '6px', padding: '0.5rem 0.625rem',
              fontSize: '0.7rem', color: '#6e6a65', fontFamily: 'monospace',
              wordBreak: 'break-all', lineHeight: 1.4,
            }}>
              {shareUrl}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={copy} style={{
              flex: 1, padding: '0.5rem', borderRadius: '6px',
              border: '1px solid #e5e0d8', background: copied ? '#f0fdf4' : '#ffffff',
              fontSize: '0.8125rem', fontWeight: 600,
              color: copied ? '#15803d' : '#1a1a1a', cursor: 'pointer',
            }}>
              {copied ? '✓ Tersalin' : 'Salin Link'}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(title + '\n' + shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '6px',
                background: '#25d366', textDecoration: 'none',
                fontSize: '0.8125rem', fontWeight: 600, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              WA
            </a>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#9c9690', marginTop: '0.625rem', lineHeight: 1.5 }}>
            Ref <strong style={{ color: '#6e6a65' }}>@{myUsername}</strong> otomatis tercatat saat ada yang beli via link ini.
          </div>
        </div>
      )}
    </div>
  )
}
