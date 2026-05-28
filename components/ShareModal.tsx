'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Props {
  slug: string
  title: string
  description?: string | null
  authorName: string
  authorUsername: string
  coverImage?: string | null
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  let linesDrawn = 0

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      if (linesDrawn === maxLines - 1) {
        ctx.fillText(line.trim().replace(/\s*\S+$/, '…'), x, currentY)
        return currentY
      }
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
      linesDrawn++
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), x, currentY)
  return currentY
}

// Portrait 1080×1920 — Instagram Story / WA Status
const W = 1080
const H = 1920
const PAD = 80

function generatePosterOnCanvas(
  canvas: HTMLCanvasElement,
  title: string,
  description: string | null | undefined,
  authorName: string
) {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background gradient (top-to-bottom warm cream)
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#faf7f2')
  grad.addColorStop(0.6, '#f0ede8')
  grad.addColorStop(1, '#e8e2d8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Decorative dot grid — top right
  ctx.fillStyle = 'rgba(26,26,26,0.07)'
  for (let col = 0; col < 10; col++) {
    for (let row = 0; row < 10; row++) {
      ctx.beginPath()
      ctx.arc(W - PAD - col * 28, PAD + row * 28, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Decorative dot grid — bottom left
  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 6; row++) {
      ctx.beginPath()
      ctx.arc(PAD + col * 28, H - PAD - row * 28, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Top accent bar (horizontal)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(PAD, 120, 120, 6)

  // XALES wordmark
  ctx.font = 'bold 52px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#1a1a1a'
  ctx.fillText('XALES', PAD, 220)

  // Tagline
  ctx.font = '32px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#9c9690'
  ctx.fillText('creator platform', PAD, 272)

  // Horizontal rule
  ctx.fillStyle = '#d4cdc4'
  ctx.fillRect(PAD, 340, W - PAD * 2, 1.5)

  // Title — large, bold, centered vertically in the middle zone
  ctx.font = 'bold 88px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#1a1a1a'
  const titleBottom = wrapText(ctx, title, PAD, 520, W - PAD * 2, 108, 5)

  // Description
  if (description) {
    ctx.font = '44px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#6e6a65'
    wrapText(ctx, description, PAD, titleBottom + 72, W - PAD * 2, 58, 3)
  }

  // Bottom dark band
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, H - 180, W, 180)

  // Rounded top corners for bottom band (fake)
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.moveTo(0, H - 196)
  ctx.quadraticCurveTo(0, H - 180, 24, H - 180)
  ctx.lineTo(W - 24, H - 180)
  ctx.quadraticCurveTo(W, H - 180, W, H - 196)
  ctx.lineTo(W, H - 180)
  ctx.lineTo(0, H - 180)
  ctx.fill()

  // Author name
  ctx.font = '500 40px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(authorName, PAD, H - 108)

  // xales.id — right aligned
  ctx.font = 'bold 40px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  const domain = 'xales.id'
  const domainW = ctx.measureText(domain).width
  ctx.fillText(domain, W - PAD - domainW, H - 108)

  // QR hint line
  ctx.font = '30px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText(`xales.id`, PAD, H - 56)
}

export default function ShareModal({
  slug,
  title,
  description,
  authorName,
  authorUsername,
  coverImage: initialCover,
}: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [coverImage, setCoverImage] = useState(initialCover ?? null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isAuthor = session?.user?.username === authorUsername
  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${authorUsername}/${slug}`
    : `https://xales.id/@${authorUsername}/${slug}`

  const drawPoster = useCallback(() => {
    if (!canvasRef.current || coverImage) return
    generatePosterOnCanvas(canvasRef.current, title, description, authorName)
  }, [title, description, authorName, coverImage])

  useEffect(() => {
    if (open && !coverImage) {
      // slight delay so canvas is mounted
      const t = setTimeout(drawPoster, 50)
      return () => clearTimeout(t)
    }
  }, [open, drawPoster, coverImage])

  const copyLink = async () => {
    await navigator.clipboard.writeText(postUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const downloadPoster = () => {
    if (coverImage) {
      const a = document.createElement('a')
      a.href = coverImage
      a.download = `${slug}-cover.jpg`
      a.click()
      return
    }
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = `${slug}-poster.png`
    a.click()
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')!
        // Cover-fit: fill 1080×1920, crop center
        const ratio = Math.max(W / img.width, H / img.height)
        const w = img.width * ratio
        const h = img.height * ratio
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        setCoverImage(dataUrl)
        setSaved(false)
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  const saveCover = async () => {
    const imageToSave = coverImage ?? canvasRef.current?.toDataURL('image/png')
    if (!imageToSave) return
    setSaving(true)
    const res = await fetch(`/api/posts/${slug}/cover`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverImage: imageToSave }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  const removeCover = async () => {
    setSaving(true)
    await fetch(`/api/posts/${slug}/cover`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverImage: null }),
    })
    setSaving(false)
    setCoverImage(null)
    setSaved(false)
    setTimeout(drawPoster, 50)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px',
          padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#6e6a65',
          cursor: 'pointer', fontWeight: 500,
        }}
      >
        <span>↗</span>
        <span>Bagikan</span>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'relative', background: '#ffffff', borderRadius: '16px',
              width: '100%', maxWidth: '540px', padding: '1.75rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.18)', zIndex: 1,
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a' }}>Bagikan</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.375rem', cursor: 'pointer', color: '#6e6a65', lineHeight: 1, padding: '0.25rem' }}
              >
                ×
              </button>
            </div>

            {/* Poster preview — portrait 9:16, centered */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.125rem' }}>
              <div
                style={{
                  position: 'relative',
                  width: '180px',   /* 180 × 320 = 9:16 */
                  height: '320px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #e5e0d8',
                  background: '#f7f5f2',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              >
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                )}
                <div
                  style={{
                    position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.65rem', whiteSpace: 'nowrap',
                    color: coverImage ? 'rgba(255,255,255,0.9)' : '#9c9690',
                    background: coverImage ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.85)',
                    padding: '0.15rem 0.5rem', borderRadius: '4px', backdropFilter: 'blur(4px)',
                  }}
                >
                  {coverImage ? '✓ Cover tersimpan' : 'Auto-generated · 1080×1920'}
                </div>
              </div>
            </div>

            {/* Copy link */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <input
                readOnly
                value={postUrl}
                style={{ flex: 1, background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#6e6a65', outline: 'none' }}
              />
              <button
                onClick={copyLink}
                style={{
                  background: copied ? '#059669' : '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px',
                  padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'background 0.2s', minWidth: '90px',
                }}
              >
                {copied ? '✓ Tersalin' : 'Salin Link'}
              </button>
            </div>

            {/* Social + download */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', background: '#000', color: '#fff', padding: '0.625rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(title + '\n' + postUrl)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', background: '#25d366', color: '#fff', padding: '0.625rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                WhatsApp
              </a>
              <button
                onClick={downloadPoster}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', background: '#f0ede8', border: '1px solid #e5e0d8', color: '#1a1a1a', padding: '0.625rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
              >
                ↓ Poster
              </button>
            </div>

            {/* Author-only: manage cover */}
            {isAuthor && (
              <div style={{ borderTop: '1px solid #e5e0d8', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  {coverImage ? 'Kelola Cover Artikel' : 'Upload Cover Custom'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ flex: 1, minWidth: '120px', background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#6e6a65', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {coverImage ? '↑ Ganti Gambar' : '↑ Pilih Gambar'}
                  </button>
                  <button
                    onClick={saveCover}
                    disabled={saving || saved}
                    style={{
                      flex: 1, minWidth: '120px', background: saved ? '#ecfdf5' : '#1a1a1a',
                      color: saved ? '#059669' : '#ffffff', border: saved ? '1px solid #86efac' : 'none',
                      borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem',
                      fontWeight: 600, cursor: saving || saved ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {saving ? 'Menyimpan...' : saved ? '✓ Cover Tersimpan' : 'Simpan sebagai Cover'}
                  </button>
                  {coverImage && (
                    <button
                      onClick={removeCover}
                      disabled={saving}
                      style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#dc2626', cursor: saving ? 'default' : 'pointer' }}
                    >
                      Hapus Cover
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.5rem' }}>
                  Cover ditampilkan di halaman artikel dan saat dibagikan. Rasio ideal 1200×630.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileUpload(f)
                    e.target.value = ''
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
