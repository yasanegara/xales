'use client'

import { useRef } from 'react'

interface Props {
  onInsert: (markdown: string) => void
}

export default function ImageUploadButton({ onInsert }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        onInsert(`\n![${altText}](${dataUrl})\n`)
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <button
        type="button"
        title="Upload gambar ke artikel"
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          background: '#f0ede8', border: '1px solid #e5e0d8', borderRadius: '6px',
          padding: '0.375rem 0.875rem', fontSize: '0.8125rem', color: '#3d3a36',
          cursor: 'pointer', fontWeight: 500,
        }}
      >
        <span>📷</span>
        <span>Upload Gambar</span>
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
