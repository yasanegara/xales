'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BuyModal from './BuyModal'

interface PostFile {
  id: string
  name: string
  mimeType: string
  size: number
  isFree: boolean
  price?: number | null
  discount?: number | null
  url?: string | null
}

interface Props {
  slug: string
  title: string
  price: number
  authorName: string
  authorUsername: string
  authorWaNumber?: string | null
  authorWaMessage?: string | null
  refCode?: string
  files?: PostFile[]
  isPurchased?: boolean
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function Paywall({ slug, title, price, authorName, authorWaNumber, authorWaMessage, refCode, files = [], isPurchased: initialPurchased = false }: Props) {
  const router = useRouter()
  const [purchased, setPurchased] = useState(initialPurchased)

  if (purchased) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.125rem' }}>✓</span>
        <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 500 }}>Kamu sudah membeli artikel ini. Selamat membaca!</span>
      </div>
    )
  }

  return (
    <div>
      {/* Blur overlay */}
      <div
        style={{
          position: 'relative', marginBottom: '2rem',
          background: 'linear-gradient(to bottom, transparent 0%, #f7f5f2 70%)',
          borderRadius: '12px', overflow: 'hidden',
        }}
      >
        {/* Locked content indicator */}
        <div
          style={{
            background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px',
            padding: '2.5rem 2rem', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Konten Premium
          </h3>
          <p style={{ color: '#6e6a65', fontSize: '0.9375rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Artikel ini memerlukan pembelian untuk dibaca seluruhnya.
          </p>
          <p style={{ color: '#9c9690', fontSize: '0.875rem', marginBottom: '2rem' }}>
            oleh <strong style={{ color: '#1a1a1a' }}>{authorName}</strong>
          </p>

          <BuyModal
            slug={slug}
            title={title}
            price={price}
            authorName={authorName}
            authorWaNumber={authorWaNumber}
            authorWaMessage={authorWaMessage}
            refCode={refCode}
            onSuccess={() => { setPurchased(true); router.refresh() }}
          />
        </div>
      </div>

      {/* Free files preview */}
      {files.filter(f => f.isFree).length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            File Gratis
          </div>
          {files.filter(f => f.isFree).map(file => (
            <a
              key={file.id}
              href={`/api/files/${file.id}`}
              download={file.name}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px',
                padding: '0.75rem 1rem', textDecoration: 'none', marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>📎</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatBytes(file.size)}</div>
              </div>
              <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>↓ Unduh</span>
            </a>
          ))}
        </div>
      )}

      {/* Paid files — with separate pricing */}
      {files.filter(f => !f.isFree).length > 0 && (
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            File Tambahan
          </div>
          {files.filter(f => !f.isFree).map(file => {
            const effectivePrice = file.price && file.discount
              ? Math.round(file.price * (1 - file.discount / 100))
              : file.price
            const fileIcon = file.mimeType === 'url/link' ? '🔗' : file.mimeType.startsWith('image/') ? '🖼' : '📎'
            return (
              <div
                key={file.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px',
                  padding: '0.75rem 1rem', marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{fileIcon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                    {file.mimeType === 'url/link' ? 'Link eksternal' : formatBytes(file.size)}
                  </div>
                </div>
                {file.price ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>
                      {file.discount && file.discount > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#9c9690', marginRight: '0.25rem', fontSize: '0.75rem' }}>
                            Rp {new Intl.NumberFormat('id-ID').format(file.price)}
                          </span>
                          <span>Rp {new Intl.NumberFormat('id-ID').format(effectivePrice!)}</span>
                        </>
                      ) : (
                        `Rp ${new Intl.NumberFormat('id-ID').format(file.price)}`
                      )}
                    </div>
                    <button
                      onClick={() => window.location.href = file.mimeType === 'url/link' && file.url ? file.url : `/api/posts/${slug}/files/${file.id}/purchase`}
                      style={{
                        fontSize: '0.75rem', fontWeight: 500, color: '#0070f3',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
                      }}
                    >
                      {file.mimeType === 'url/link' ? 'Buka' : 'Beli'}
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>Perlu beli artikel</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
