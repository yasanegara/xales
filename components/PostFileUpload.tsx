'use client'

import { useRef, useState } from 'react'

export interface AttachedFile {
  name: string
  mimeType: string
  size: number
  data?: string      // base64 for uploaded files
  url?: string       // external URL for link attachments
  isFree: boolean
  price?: number     // IDR — if set, file can be bought separately
  discount?: number  // % off
}

interface Props {
  files: AttachedFile[]
  onChange: (files: AttachedFile[]) => void
  isPremium: boolean
}

const MAX_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function fileIcon(mime: string) {
  if (mime === 'url/link') return '🔗'
  if (mime.startsWith('image/')) return '🖼'
  if (mime === 'application/pdf') return '📄'
  if (mime.includes('zip') || mime.includes('rar')) return '🗜'
  if (mime.includes('video')) return '🎬'
  if (mime.includes('audio')) return '🎵'
  return '📎'
}

function effectivePrice(price?: number, discount?: number) {
  if (!price) return 0
  if (!discount) return price
  return Math.round(price * (1 - discount / 100))
}

export default function PostFileUpload({ files, onChange, isPremium }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [linkMode, setLinkMode] = useState(false)
  const [linkForm, setLinkForm] = useState({ name: '', url: '' })

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE) { alert('File maks 10MB'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = (e.target!.result as string).split(',')[1]
      onChange([...files, { name: file.name, mimeType: file.type, size: file.size, data, isFree: !isPremium }])
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const addLink = () => {
    if (!linkForm.url.trim()) return
    const name = linkForm.name.trim() || linkForm.url
    onChange([...files, { name, mimeType: 'url/link', size: 0, url: linkForm.url.trim(), isFree: !isPremium }])
    setLinkForm({ name: '', url: '' })
    setLinkMode(false)
  }

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i))

  const update = (i: number, patch: Partial<AttachedFile>) =>
    onChange(files.map((f, idx) => idx === i ? { ...f, ...patch } : f))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>
          File Lampiran
          <span style={{ marginLeft: '0.5rem', color: '#9c9690' }}>(PDF, ZIP, gambar · maks 10MB · atau link)</span>
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => { setLinkMode(false); inputRef.current?.click() }} disabled={uploading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#3d3a36', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
            {uploading ? '...' : '📎 Upload File'}
          </button>
          <button type="button" onClick={() => setLinkMode(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: linkMode ? '#1a1a1a' : '#f0ede8', border: `1px solid ${linkMode ? '#1a1a1a' : '#e5e0d8'}`, borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: linkMode ? '#f7f5f2' : '#3d3a36', cursor: 'pointer', fontWeight: 500 }}>
            🔗 Tempel Link
          </button>
        </div>
      </div>

      {/* Link input panel */}
      {linkMode && (
        <div style={{ background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.75rem' }}>
            Tempel URL app atau resource eksternal. Pembeli akan mendapatkan akses ke link ini setelah pembelian.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.25rem' }}>Label (opsional)</label>
              <input type="text" value={linkForm.name} onChange={e => setLinkForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Akses App" style={{ width: '100%', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.25rem' }}>URL *</label>
              <input type="url" value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://app.saya.com" style={{ width: '100%', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }} />
            </div>
            <button type="button" onClick={addLink} disabled={!linkForm.url.trim()}
              style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: linkForm.url ? 'pointer' : 'not-allowed', opacity: linkForm.url ? 1 : 0.5 }}>
              Tambah
            </button>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          {files.map((file, i) => (
            <div key={i} style={{ background: '#fafaf8', borderBottom: i < files.length - 1 ? '1px solid #f0ede8' : 'none', padding: '0.875rem 1rem' }}>
              {/* Row 1: file info + free/paid toggle + remove */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: file.isFree ? 0 : '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{fileIcon(file.mimeType)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                    {file.mimeType === 'url/link' ? 'Link eksternal' : formatBytes(file.size)}
                  </div>
                </div>
                <button type="button" onClick={() => update(i, { isFree: !file.isFree, price: undefined, discount: undefined })}
                  style={{ flexShrink: 0, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', padding: '0.25rem 0.625rem', borderRadius: '4px', border: `1px solid ${file.isFree ? '#86efac' : '#fcd34d'}`, background: file.isFree ? '#f0fdf4' : '#fffbeb', color: file.isFree ? '#15803d' : '#92400e' }}>
                  {file.isFree ? 'Gratis' : 'Berbayar'}
                </button>
                <button type="button" onClick={() => remove(i)}
                  style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', padding: '0.25rem' }}>×</button>
              </div>

              {/* Row 2: price + discount (only when not free) */}
              {!file.isFree && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', paddingLeft: '2.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.25rem' }}>
                      Harga (IDR) — biarkan kosong = butuh beli artikel
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.8125rem' }}>Rp</span>
                      <input type="text" value={file.price ? String(file.price) : ''} placeholder="Harga tersendiri"
                        onChange={e => { const raw = e.target.value.replace(/\D/g, ''); update(i, { price: raw ? parseInt(raw) : undefined }) }}
                        style={{ width: '100%', paddingLeft: '2.25rem', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ width: '120px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.25rem' }}>Diskon %</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" min={0} max={99} value={file.discount ?? ''} placeholder="0"
                        onChange={e => { const v = parseInt(e.target.value); update(i, { discount: isNaN(v) ? undefined : Math.min(99, Math.max(0, v)) }) }}
                        style={{ width: '100%', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.4rem 1.75rem 0.4rem 0.75rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }} />
                      <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9c9690', fontSize: '0.75rem' }}>%</span>
                    </div>
                  </div>
                  {file.price && (
                    <div style={{ fontSize: '0.8125rem', color: '#059669', whiteSpace: 'nowrap', paddingBottom: '0.375rem' }}>
                      {file.discount ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#9c9690', marginRight: '0.25rem' }}>Rp {formatIDR(file.price)}</span>
                          Rp {formatIDR(effectivePrice(file.price, file.discount))}
                        </>
                      ) : `= Rp ${formatIDR(file.price)}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && !linkMode && (
        <div onClick={() => inputRef.current?.click()} style={{ border: '1px dashed #d0c9b8', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', color: '#9c9690', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
          Klik untuk upload file lampiran, atau gunakan "Tempel Link" untuk link eksternal
        </div>
      )}

      <input ref={inputRef} type="file" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}
