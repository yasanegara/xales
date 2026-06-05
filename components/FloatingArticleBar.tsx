'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Props {
  slug: string
  title: string
  description?: string | null
  authorUsername: string
}

interface Bookmark {
  scrollY: number
  heading: string
  savedAt: number
}

export default function FloatingArticleBar({ slug, title, description, authorUsername }: Props) {
  const { data: session } = useSession()
  const [visible, setVisible]           = useState(false)
  const [saved, setSaved]               = useState(false)
  const [saveLoading, setSaveLoading]   = useState(false)
  const [bookmark, setBookmark]         = useState<Bookmark | null>(null)
  const [bmFlash, setBmFlash]           = useState(false)
  const [copied, setCopied]             = useState(false)
  const [noteOpen, setNoteOpen]         = useState(false)
  const [noteQuote, setNoteQuote]       = useState('')
  const [noteComment, setNoteComment]   = useState('')
  const [noteSaving, setNoteSaving]     = useState(false)
  const [noteSaved, setNoteSaved]       = useState(false)

  const bmKey = `tweak_bm_${slug}`

  // Show bar after scrolling 300px
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Load bookmark from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(bmKey)
    if (raw) setBookmark(JSON.parse(raw))
  }, [bmKey])

  // Load save state from server
  useEffect(() => {
    if (!session) return
    fetch(`/api/posts/${slug}/save`)
      .then(r => r.json())
      .then(d => setSaved(d.saved))
  }, [slug, session])

  // Listen for note-open event from NoteSelectionPopup
  useEffect(() => {
    const handler = (e: Event) => {
      const { quote } = (e as CustomEvent<{ quote: string }>).detail
      setNoteQuote(quote)
      setNoteComment('')
      setNoteOpen(true)
    }
    window.addEventListener('open-note-modal', handler)
    return () => window.removeEventListener('open-note-modal', handler)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const saveBookmark = useCallback(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    let nearestHeading = ''
    for (const el of headings) {
      if (el.getBoundingClientRect().top <= 100) nearestHeading = el.textContent ?? ''
    }
    const data: Bookmark = { scrollY: window.scrollY, heading: nearestHeading, savedAt: Date.now() }
    localStorage.setItem(bmKey, JSON.stringify(data))
    setBookmark(data)
    setBmFlash(true)
    setTimeout(() => setBmFlash(false), 2000)
  }, [bmKey])

  const resumeBookmark = () => {
    if (bookmark) window.scrollTo({ top: bookmark.scrollY, behavior: 'smooth' })
  }

  const toggleSave = async () => {
    if (!session) return
    setSaveLoading(true)
    const res = await fetch(`/api/posts/${slug}/save`, { method: saved ? 'DELETE' : 'POST' })
    if (res.ok) setSaved(!saved)
    setSaveLoading(false)
  }

  const share = async () => {
    const url = `${window.location.origin}/@${authorUsername}/${slug}`
    if (navigator.share) {
      navigator.share({ title, text: description ?? title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openNoteModal = () => {
    setNoteQuote('')
    setNoteComment('')
    setNoteOpen(true)
  }

  const saveNote = async () => {
    if (!session || !noteQuote.trim()) return
    setNoteSaving(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postSlug: slug, postTitle: title, postAuthorUsername: authorUsername, quote: noteQuote, comment: noteComment }),
    })
    setNoteSaving(false)
    if (res.ok) {
      setNoteSaved(true)
      setTimeout(() => {
        setNoteOpen(false)
        setNoteSaved(false)
        setNoteQuote('')
        setNoteComment('')
      }, 1200)
    }
  }

  const btn = (active: boolean, color?: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px',
    background: active ? '#f0ede8' : '#ffffff',
    border: `1px solid ${active ? '#c4bfb8' : '#e5e0d8'}`,
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    color: color ?? (active ? '#1a1a1a' : '#6e6a65'),
    transition: 'all 0.15s',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  })

  return (
    <>
      {/* Floating sidebar bar */}
      <div style={{
        position: 'fixed',
        right: '1.25rem',
        top: '50%',
        transform: `translateY(-50%) ${visible ? 'scale(1)' : 'scale(0.85)'}`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'opacity 0.2s, transform 0.2s',
      }}>
        {/* Scroll to top */}
        <button onClick={scrollToTop} style={btn(false)} title="Ke atas">
          ↑
        </button>

        {/* Resume bookmark */}
        {bookmark && (
          <button
            onClick={resumeBookmark}
            style={btn(true, '#92400e')}
            title={`Lanjut dari: "${bookmark.heading || 'posisi tersimpan'}"`}
          >
            ↩
          </button>
        )}

        {/* Save bookmark */}
        <button onClick={saveBookmark} style={btn(bmFlash, bmFlash ? '#16a34a' : undefined)} title="Simpan posisi baca">
          {bmFlash ? '✓' : '🔖'}
        </button>

        {/* Save to Library */}
        {session && (
          <button
            onClick={toggleSave}
            disabled={saveLoading}
            style={btn(saved, saved ? '#1d4ed8' : undefined)}
            title={saved ? 'Tersimpan di Library' : 'Simpan ke Library'}
          >
            {saved ? '★' : '☆'}
          </button>
        )}

        {/* Share */}
        <button onClick={share} style={btn(copied, copied ? '#059669' : undefined)} title={copied ? 'Link disalin!' : 'Bagikan'}>
          {copied ? '✓' : '↗'}
        </button>

        {/* Save Note */}
        {session && (
          <button onClick={openNoteModal} style={btn(false)} title="Simpan catatan">
            ✏
          </button>
        )}
      </div>

      {/* Note Modal */}
      {noteOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setNoteOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>✏ Simpan Catatan</div>
              <button
                onClick={() => setNoteOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9c9690', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Quote */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                Quote / Kutipan
              </label>
              <textarea
                value={noteQuote}
                onChange={e => setNoteQuote(e.target.value)}
                placeholder="Teks yang ingin disimpan…"
                rows={3}
                style={{
                  width: '100%', resize: 'vertical',
                  border: '1px solid #e5e0d8', borderRadius: '8px',
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.9rem', fontFamily: 'Georgia, serif',
                  color: '#1a1a1a', background: '#faf7f2',
                  outline: 'none', boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Personal note */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                Catatan saya (opsional)
              </label>
              <textarea
                value={noteComment}
                onChange={e => setNoteComment(e.target.value)}
                placeholder="Tambahkan pemikiran atau konteks pribadi…"
                rows={2}
                style={{
                  width: '100%', resize: 'vertical',
                  border: '1px solid #e5e0d8', borderRadius: '8px',
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a', background: '#ffffff',
                  outline: 'none', boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setNoteOpen(false)}
                style={{
                  background: 'none', border: '1px solid #e5e0d8',
                  borderRadius: '8px', padding: '0.5rem 1rem',
                  fontSize: '0.875rem', color: '#6e6a65', cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={saveNote}
                disabled={!noteQuote.trim() || noteSaving || noteSaved}
                style={{
                  background: noteSaved ? '#f0fdf4' : '#1a1a1a',
                  border: `1px solid ${noteSaved ? '#86efac' : '#1a1a1a'}`,
                  borderRadius: '8px', padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 600,
                  color: noteSaved ? '#16a34a' : '#ffffff',
                  cursor: !noteQuote.trim() || noteSaving || noteSaved ? 'default' : 'pointer',
                  opacity: !noteQuote.trim() ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {noteSaved ? '✓ Tersimpan!' : noteSaving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
