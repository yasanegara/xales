'use client'

import { useRef, useState } from 'react'

interface Props {
  currentPic: string
  fallbackInitial: string
  onUpload: (dataUrl: string) => void
}

export default function AvatarUpload({ currentPic, fallbackInitial, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(currentPic)
  const [dragging, setDragging] = useState(false)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const SIZE = 300
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')!
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setPreview(dataUrl)
        onUpload(dataUrl)
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Avatar preview */}
      <div
        style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: '#f0ede8', border: '2px solid #e5e0d8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
          fontSize: '2rem', fontWeight: 700, color: '#6e6a65',
          position: 'relative',
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          fallbackInitial.toUpperCase()
        )}
      </div>

      {/* Upload controls */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px',
              padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#1a1a1a',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Ganti Foto
          </button>
          {preview && preview !== currentPic && (
            <button
              type="button"
              onClick={() => { setPreview(currentPic); onUpload(currentPic) }}
              style={{
                background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px',
                padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#6e6a65',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9c9690' }}>
          JPG / PNG · Otomatis dipotong jadi kotak · Maks 5MB
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) processFile(file)
          }}
          style={{
            marginTop: '0.5rem',
            border: `1px dashed ${dragging ? '#1a1a1a' : '#d0c9b8'}`,
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            color: dragging ? '#1a1a1a' : '#9c9690',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onClick={() => inputRef.current?.click()}
        >
          {dragging ? 'Lepas di sini' : 'atau drag & drop gambar ke sini'}
        </div>
      </div>

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
    </div>
  )
}
