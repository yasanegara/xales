'use client'

import { useRef, useState } from 'react'

interface Props {
  onInsert: (markdown: string) => void
}

export default function ImageUploadButton({ onInsert }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)

    try {
      // Compress with Canvas (max 1000px wide)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_W = 1000
            const ratio = Math.min(1, MAX_W / img.width)
            canvas.width = Math.round(img.width * ratio)
            canvas.height = Math.round(img.height * ratio)
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
            // Strip "data:image/jpeg;base64," prefix — API only needs the raw base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
            resolve(dataUrl.split(',')[1])
          }
          img.onerror = reject
          img.src = e.target!.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, mimeType: 'image/jpeg' }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Gagal upload gambar')
        return
      }

      const { url } = await res.json()
      const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      onInsert(`\n![${altText}](${url})\n`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        title="Upload gambar ke artikel"
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          background: uploading ? '#f0ede8' : '#f0ede8',
          border: '1px solid #e5e0d8', borderRadius: '6px',
          padding: '0.375rem 0.875rem', fontSize: '0.8125rem',
          color: uploading ? '#9c9690' : '#3d3a36',
          cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 500,
        }}
      >
        <span>📷</span>
        <span>{uploading ? 'Mengupload...' : 'Upload Gambar'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
          e.target.value = ''
        }}
      />
    </>
  )
}
