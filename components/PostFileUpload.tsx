'use client'

import { useRef, useState } from 'react'

export interface AttachedFile {
  name: string
  mimeType: string
  size: number
  data: string  // base64
  isFree: boolean
}

interface Props {
  files: AttachedFile[]
  onChange: (files: AttachedFile[]) => void
  isPremium: boolean
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PostFileUpload({ files, onChange, isPremium }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE) { alert('File maks 10MB'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = (e.target!.result as string).split(',')[1] // strip data: prefix
      onChange([
        ...files,
        { name: file.name, mimeType: file.type, size: file.size, data, isFree: !isPremium },
      ])
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i))

  const toggleFree = (i: number) =>
    onChange(files.map((f, idx) => idx === i ? { ...f, isFree: !f.isFree } : f))

  const fileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '🖼'
    if (mime === 'application/pdf') return '📄'
    if (mime.includes('zip') || mime.includes('rar')) return '🗜'
    if (mime.includes('video')) return '🎬'
    if (mime.includes('audio')) return '🎵'
    return '📎'
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>
          File Lampiran
          <span style={{ marginLeft: '0.5rem', color: '#9c9690' }}>(PDF, ZIP, gambar, dll · maks 10MB)</span>
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px',
            padding: '0.375rem 0.875rem', fontSize: '0.8125rem', color: '#3d3a36',
            cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 500,
          }}
        >
          {uploading ? '...' : '+ Tambah File'}
        </button>
      </div>

      {files.length > 0 && (
        <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderBottom: i < files.length - 1 ? '1px solid #f0ede8' : 'none',
                background: '#fafaf8',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{fileIcon(file.mimeType)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatBytes(file.size)}</div>
              </div>

              {isPremium && (
                <button
                  type="button"
                  onClick={() => toggleFree(i)}
                  style={{
                    flexShrink: 0,
                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                    padding: '0.25rem 0.625rem', borderRadius: '4px',
                    border: `1px solid ${file.isFree ? '#86efac' : '#fcd34d'}`,
                    background: file.isFree ? '#f0fdf4' : '#fffbeb',
                    color: file.isFree ? '#15803d' : '#92400e',
                  }}
                >
                  {file.isFree ? 'Gratis' : 'Berbayar'}
                </button>
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', padding: '0.25rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '1px dashed #d0c9b8', borderRadius: '8px', padding: '1.25rem',
            textAlign: 'center', color: '#9c9690', fontSize: '0.875rem',
            cursor: 'pointer', marginBottom: '0.5rem',
          }}
        >
          Klik untuk tambah file lampiran
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
    </div>
  )
}
