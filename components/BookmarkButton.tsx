'use client'

import { useState, useEffect } from 'react'

interface Bookmark {
  scrollY: number
  heading: string
  savedAt: number
}

export default function BookmarkButton({ slug }: { slug: string }) {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null)
  const [saved, setSaved] = useState(false)
  const key = `xales_bm_${slug}`

  useEffect(() => {
    const raw = localStorage.getItem(key)
    if (raw) setBookmark(JSON.parse(raw))
  }, [key])

  const save = () => {
    // Find the nearest heading above current scroll position
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    let nearestHeading = ''
    for (const el of headings) {
      if (el.getBoundingClientRect().top <= 100) {
        nearestHeading = el.textContent ?? ''
      }
    }

    const data: Bookmark = {
      scrollY: window.scrollY,
      heading: nearestHeading,
      savedAt: Date.now(),
    }

    localStorage.setItem(key, JSON.stringify(data))
    setBookmark(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = () => {
    localStorage.removeItem(key)
    setBookmark(null)
  }

  const resume = () => {
    if (!bookmark) return
    window.scrollTo({ top: bookmark.scrollY, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {/* Resume reading banner */}
      {bookmark && (
        <button
          onClick={resume}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
            padding: '0.375rem 0.75rem',
            fontSize: '0.8125rem',
            color: '#92400e',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          title={bookmark.heading ? `Lanjut dari: "${bookmark.heading}"` : 'Lanjut membaca'}
        >
          <span>↩</span>
          <span>Lanjut baca</span>
          <button
            onClick={(e) => { e.stopPropagation(); clear() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', marginLeft: '0.125rem', padding: 0, fontSize: '0.875rem', lineHeight: 1 }}
            title="Hapus bookmark"
          >
            ×
          </button>
        </button>
      )}

      {/* Save bookmark button */}
      <button
        onClick={save}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: saved ? '#f0fdf4' : '#f7f5f2',
          border: `1px solid ${saved ? '#86efac' : '#e5e0d8'}`,
          borderRadius: '6px',
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          color: saved ? '#16a34a' : '#6e6a65',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: 500,
        }}
        title="Simpan posisi baca"
      >
        <span>{saved ? '✓' : '🔖'}</span>
        <span>{saved ? 'Tersimpan!' : 'Bookmark'}</span>
      </button>
    </div>
  )
}
