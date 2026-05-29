'use client'

import { useState, useEffect, useRef } from 'react'

const FONT_SIZES = { sm: '0.9rem', md: '1rem', lg: '1.175rem' } as const
type FontSize = keyof typeof FONT_SIZES

const FONT_FAMILIES = {
  sans:  { label: 'Sans',  css: 'system-ui, -apple-system, sans-serif', preview: 'Aa' },
  serif: { label: 'Serif', css: 'Georgia, "Times New Roman", serif',    preview: 'Aa' },
  mono:  { label: 'Mono',  css: 'var(--font-mono, monospace)',           preview: 'Aa' },
} as const
type FontFamily = keyof typeof FONT_FAMILIES

export const READING_EVENT = 'tweak-reading-settings'

export default function TampilanButton() {
  const [readMode, setReadMode]   = useState(false)
  const [fontSize, setFontSize]   = useState<FontSize>('md')
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans')
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mode = localStorage.getItem('tweak_read_mode')
    const size = localStorage.getItem('tweak_font_size') as FontSize | null
    const fam  = localStorage.getItem('tweak_font_family') as FontFamily | null
    if (mode === '1') setReadMode(true)
    if (size && size in FONT_SIZES) setFontSize(size)
    if (fam  && fam  in FONT_FAMILIES) setFontFamily(fam)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }
    if (showPanel) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showPanel])

  const dispatch = (rm: boolean, fs: FontSize, ff: FontFamily) => {
    window.dispatchEvent(new CustomEvent(READING_EVENT, { detail: { readMode: rm, fontSize: fs, fontFamily: ff } }))
  }

  const toggleReadMode = () => {
    const next = !readMode
    setReadMode(next)
    localStorage.setItem('tweak_read_mode', next ? '1' : '0')
    dispatch(next, fontSize, fontFamily)
  }

  const setSize = (size: FontSize) => {
    setFontSize(size)
    localStorage.setItem('tweak_font_size', size)
    dispatch(readMode, size, fontFamily)
  }

  const setFamily = (fam: FontFamily) => {
    setFontFamily(fam)
    localStorage.setItem('tweak_font_family', fam)
    dispatch(readMode, fontSize, fam)
  }

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setShowPanel(p => !p)}
        title="Pengaturan tampilan baca"
        style={{
          display: 'flex', alignItems: 'baseline', gap: '1px',
          background: showPanel ? '#1a1a1a' : '#f0ede8',
          border: `1px solid ${showPanel ? '#1a1a1a' : '#e5e0d8'}`,
          borderRadius: '6px', padding: '0.3rem 0.5rem',
          color: showPanel ? '#f7f5f2' : '#6e6a65',
          cursor: 'pointer', transition: 'all 0.15s',
          fontWeight: 700, fontFamily: 'Georgia, serif', lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '0.6rem' }}>A</span>
        <span style={{ fontSize: '0.85rem' }}>A</span>
        <span style={{ fontSize: '1.1rem' }}>A</span>
      </button>

      {showPanel && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#ffffff', border: '1px solid #e5e0d8',
          borderRadius: '10px', padding: '1.125rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 40, width: '252px',
        }}>
          {/* Read Mode */}
          <div style={{ marginBottom: '1.125rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Mode Baca
            </div>
            <button
              onClick={toggleReadMode}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: readMode ? '#faf7f0' : '#f7f5f2',
                border: `1px solid ${readMode ? '#d4c9b0' : '#e5e0d8'}`,
                borderRadius: '8px', padding: '0.625rem 0.875rem',
                cursor: 'pointer', fontSize: '0.875rem', color: '#1a1a1a', transition: 'all 0.15s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>Nyaman di Mata</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '1px' }}>
                  {readMode ? 'Aktif · Latar hangat & spasi lebar' : 'Nonaktif'}
                </div>
              </div>
              <div style={{ flexShrink: 0, width: '36px', height: '20px', background: readMode ? '#1a1a1a' : '#d1cdc7', borderRadius: '10px', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: '3px', left: readMode ? '19px' : '3px', width: '14px', height: '14px', background: '#ffffff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </button>
          </div>

          {/* Font Family */}
          <div style={{ marginBottom: '1.125rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Font
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(Object.entries(FONT_FAMILIES) as [FontFamily, typeof FONT_FAMILIES[FontFamily]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFamily(key)}
                  style={{
                    flex: 1, padding: '0.5rem 0.25rem',
                    border: `1px solid ${fontFamily === key ? '#1a1a1a' : '#e5e0d8'}`,
                    borderRadius: '6px',
                    background: fontFamily === key ? '#1a1a1a' : '#f7f5f2',
                    color: fontFamily === key ? '#ffffff' : '#6e6a65',
                    cursor: 'pointer', lineHeight: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontFamily: val.css, fontWeight: key === 'mono' ? 400 : 600 }}>{val.preview}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7 }}>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Ukuran Teks
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['sm', 'md', 'lg'] as const).map((key, i) => (
                <button
                  key={key}
                  onClick={() => setSize(key)}
                  title={['Kecil', 'Sedang', 'Besar'][i]}
                  style={{
                    flex: 1, padding: '0.5rem 0.25rem',
                    border: `1px solid ${fontSize === key ? '#1a1a1a' : '#e5e0d8'}`,
                    borderRadius: '6px',
                    background: fontSize === key ? '#1a1a1a' : '#f7f5f2',
                    color: fontSize === key ? '#ffffff' : '#6e6a65',
                    cursor: 'pointer', fontSize: ['0.8rem', '1rem', '1.2rem'][i],
                    fontWeight: 600, lineHeight: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    transition: 'all 0.15s',
                  }}
                >
                  A
                  <span style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7 }}>{['Kecil', 'Sedang', 'Besar'][i]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
