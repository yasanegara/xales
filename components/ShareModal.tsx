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
const PAD = 90

function generatePosterOnCanvas(
  canvas: HTMLCanvasElement,
  title: string,
  description: string | null | undefined,
  authorName: string
) {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const F = '-apple-system, system-ui, sans-serif'

  // ── Full dark background ──────────────────────────────────────────
  ctx.fillStyle = '#141210'
  ctx.fillRect(0, 0, W, H)

  // Subtle noise / dot texture
  ctx.fillStyle = 'rgba(255,255,255,0.018)'
  for (let x = 0; x < W; x += 22) {
    for (let y = 0; y < H; y += 22) {
      ctx.fillRect(x, y, 1.5, 1.5)
    }
  }

  // ── Header zone (0–340px) ─────────────────────────────────────────
  // Top cream accent line
  ctx.fillStyle = '#f0ede8'
  ctx.fillRect(0, 0, W, 7)

  // XALES wordmark
  ctx.font = `bold 48px ${F}`
  ctx.fillStyle = '#f0ede8'
  ctx.fillText('tweak', PAD, 120)

  // Dot separator after wordmark
  const wMeasure = ctx.measureText('tweak').width
  ctx.beginPath()
  ctx.arc(PAD + wMeasure + 28, 110, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#6e6a65'
  ctx.fill()

  // Tagline
  ctx.font = `32px ${F}`
  ctx.fillStyle = '#6e6a65'
  ctx.fillText('Creator Platform', PAD, 180)

  // Thin horizontal rule
  ctx.fillStyle = '#2a2724'
  ctx.fillRect(PAD, 230, W - PAD * 2, 1)

  // ── Content zone (280–1580px) — safe area ─────────────────────────
  // Adaptive font size based on title length
  const tLen = title.length
  const tSize = tLen > 90 ? 54 : tLen > 65 ? 64 : tLen > 40 ? 74 : 86
  const tLineH = Math.round(tSize * 1.3)
  // Max lines that fit in safe zone (1580 - 310) / lineHeight
  const safeZone = 1580 - 310
  const tMaxLines = Math.min(8, Math.floor(safeZone / tLineH))

  ctx.font = `bold ${tSize}px ${F}`
  ctx.fillStyle = '#ffffff'
  const titleBottom = wrapText(ctx, title, PAD, 310, W - PAD * 2, tLineH, tMaxLines)

  // Description
  if (description) {
    const dStart = Math.min(titleBottom + 60, 1420)
    const dRemaining = 1540 - dStart
    const dMaxLines = Math.max(1, Math.floor(dRemaining / 54))
    if (dMaxLines >= 1) {
      ctx.font = `38px ${F}`
      ctx.fillStyle = '#8a8480'
      wrapText(ctx, description, PAD, dStart, W - PAD * 2, 54, dMaxLines)
    }
  }

  // ── Footer zone (1600–1920px) ─────────────────────────────────────
  // Gradient fade to footer
  const footerGrad = ctx.createLinearGradient(0, 1580, 0, 1920)
  footerGrad.addColorStop(0, 'rgba(20,18,16,0)')
  footerGrad.addColorStop(0.3, 'rgba(20,18,16,1)')
  ctx.fillStyle = footerGrad
  ctx.fillRect(0, 1580, W, 340)

  // Separator line
  ctx.fillStyle = '#2a2724'
  ctx.fillRect(PAD, 1680, W - PAD * 2, 1)

  // Author name
  ctx.font = `500 36px ${F}`
  ctx.fillStyle = 'rgba(240,237,232,0.6)'
  ctx.fillText(authorName, PAD, 1770)

  // tweak.id — right-aligned
  ctx.font = `bold 36px ${F}`
  ctx.fillStyle = '#f0ede8'
  const domain = 'tweak.id'
  const dW = ctx.measureText(domain).width
  ctx.fillText(domain, W - PAD - dW, 1770)

  // URL hint line
  ctx.font = `26px ${F}`
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillText(`tweak.id/@${authorName.replace('@', '')}`, PAD, 1850)

  // Bottom cream accent line
  ctx.fillStyle = '#f0ede8'
  ctx.fillRect(0, H - 6, W, 6)
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
  const myUsername = session?.user?.username
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${authorUsername}/${slug}`
    : `https://tweak.id/@${authorUsername}/${slug}`
  // Non-authors get affiliate ref appended automatically
  const postUrl = myUsername && !isAuthor
    ? `${baseUrl}?ref=${myUsername}`
    : baseUrl

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
        title="Bagikan"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px',
          padding: '0.3rem 0.5rem', fontSize: '1rem', color: '#6e6a65',
          cursor: 'pointer',
        }}
      >
        <span>↗</span>
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
