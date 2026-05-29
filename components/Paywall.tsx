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
  preview?: string
  postType?: string
  coverImage?: string | null
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function AppScreenshotPreview({ coverImage, title }: { coverImage?: string | null; title: string }) {
  const fallbackGrad = 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 50%, #1a1040 100%)'

  return (
    <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e0d8', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      {/* Fake browser bar */}
      <div style={{ background: '#f0ede8', borderBottom: '1px solid #e5e0d8', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fc5c65' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffd32a' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#05c46b' }} />
        </div>
        <div style={{ flex: 1, background: '#ffffff', borderRadius: '4px', padding: '0.2rem 0.625rem', fontSize: '0.7rem', color: '#9c9690', border: '1px solid #e5e0d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          tweak.id/app/{title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}
        </div>
      </div>

      {/* Blurred screenshot area */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        {/* Background: cover image or gradient */}
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px)', transform: 'scale(1.08)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: fallbackGrad, filter: 'blur(4px)', transform: 'scale(1.05)' }} />
        )}

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            🔒
          </div>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            Preview terkunci
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0 }}>
            Beli untuk membuka akses penuh
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Paywall({ slug, title, price, authorName, authorWaNumber, authorWaMessage, refCode, files = [], isPurchased: initialPurchased = false, preview = '', postType, coverImage }: Props) {
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

  const isApp = postType === 'html'

  // Strip markdown syntax for plain text preview
  const plainPreview = preview
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim()

  return (
    <div>
      {/* Preview */}
      {isApp ? (
        <AppScreenshotPreview coverImage={coverImage} title={title} />
      ) : (
        plainPreview && (
          <div style={{ position: 'relative', marginBottom: '0', maxHeight: '8rem', overflow: 'hidden' }}>
            <p style={{ fontSize: '1rem', color: '#4a4540', lineHeight: 1.8, margin: 0 }}>
              {plainPreview}
            </p>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '5rem',
              background: 'linear-gradient(to bottom, transparent, #f7f5f2)',
            }} />
          </div>
        )
      )}

      {/* Lock box */}
      <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px',
          padding: '2.5rem 2rem', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {!isApp && <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>}
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>
            {isApp ? 'Buka Akses App' : 'Konten Premium'}
          </h3>
          <p style={{ color: '#6e6a65', fontSize: '0.9375rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            {isApp
              ? 'Beli sekali, gunakan selamanya.'
              : 'Artikel ini memerlukan pembelian untuk dibaca seluruhnya.'}
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
                      onClick={() => {
                        if (file.mimeType === 'url/link') {
                          router.push(`/app/${file.id}`)
                        } else {
                          window.location.href = `/api/posts/${slug}/files/${file.id}/purchase`
                        }
                      }}
                      style={{
                        fontSize: '0.75rem', fontWeight: 500, color: '#0070f3',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
                      }}
                    >
                      {file.mimeType === 'url/link' ? 'Beli & Buka' : 'Beli'}
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
